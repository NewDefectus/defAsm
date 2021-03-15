const MAX_INSTR_SIZE = 15; // Instructions are guaranteed to be at most 15 bytes
var labelException = false; // True if the currently parsed instruction needs to be recompiled later for labels

function parseInstruction(opcode)
{
    let result = new Instruction(opcode);
    try
    {
        startTokenRecording();
        result.parse();
        stopTokenRecording();
    }
    catch(e)
    {
        stopTokenRecording();
        throw e;
    }

    if(labelException)
    {
        // Save the token recording for future recompilation
        while(token != ';' && token != '\n') next();
        result.tokens = stopTokenRecording().slice(0, -1);
    }
    return result;
}

function Instruction(opcode)
{
    this.opcode = opcode;
    this.bytes = new Uint8Array(MAX_INSTR_SIZE);
    this.length = 0;
}

// Generate a single byte
Instruction.prototype.genByte = function(byte)
{
    this.bytes[this.length++] = Number(byte);
}

// Generate an integer with a given size
Instruction.prototype.genInteger = function(byte, size)
{
    do
    {
        this.genByte(byte & 0xffn);
        byte >>= 8n;
    } while(size -= 8);
}

Instruction.prototype.parse = function()
{
    let opcode = this.opcode, operand = null, globalSize = -1, enforceSize = false;
    let prefsToGen = 0;
    let reg = null, rm = null, imms = [], vop = null;
    if(this.tokens) replayTokenRecording(this.tokens);
    this.length = 0;

    labelException = false;

    if(prefixes.hasOwnProperty(opcode))
    {
        this.genByte(prefixes[opcode]);
        ungetToken(token);
        token = ';';
        return;
    }

    if(!mnemonics.hasOwnProperty(opcode))
    {
        globalSize = suffixes[opcode[opcode.length - 1]];
        opcode = opcode.slice(0, -1);
        if(!mnemonics.hasOwnProperty(opcode))
            throw "Unknown opcode";
        if(globalSize === undefined)
            throw "Invalid opcode suffix";
        enforceSize = true;
    }
    let variations = mnemonics[opcode], operands = [], rexVal = 0x40;

    while(token != ';' && token != '\n')
    {
        operand = new Operand(globalSize);
        if(token == ':') // Segment specification for addressing
        {
            if(operand.type != OPT.SEG)
                throw "Incorrect prefix";
            this.genByte([0x26, 0x2E, 0x36, 0x3E, 0x64, 0x65][operand.reg]);
            next();
            operand = new Operand();
            if(operand.type != OPT.MEM)
                throw "Segment prefix must be followed by memory reference";
        }

        operands.push(operand);
        prefsToGen |= operand.prefs;

        // Infer default size from register operands
        if(globalSize < operand.size && (operand.type == OPT.REG || operand.type == OPT.SEG))
            globalSize = operand.size;

        if(token != ',') break;
        next();
    }

    let singleImm = operands.length == 1 && operands[0].type == OPT.IMM;

    //console.log(operands);
    if(globalSize < 0 && operands.length > 0)
    {
        // If there's just one operand and it's an immediate, the overall size is the inferred size
        if(singleImm) globalSize = operands[0].size;
    }
    else for(let o of operands)
    {
        if(isNaN(o.size) // Unknown sizes (e.g. memory) default to the global size
        || (o.type == OPT.IMM && o.size > globalSize) // Reduce immediates to global size (downcast only)
        || enforceSize) // If a suffix has been entered, it applies on all operands
            o.size = globalSize;
    }


    // Now, we'll find the matching mnemonic for this operand list
    let i, mnemonic, found = false, mnemTemp;

    mnemonicLoop:
    for(mnemonic of variations)
    {
        if(mnemonic.operandTemplates.length != operands.length) continue;
        if(operands.length == 0 && mnemonic.globalSize && !(mnemonic.globalSize == globalSize || mnemonic.defsTo16 || mnemonic.defsTo64)) continue;
        for(i = 0; mnemTemp = mnemonic.operandTemplates[i], operand = operands[i]; i++)
        {
            if(!mnemTemp.matchType(operand)
            || !(mnemTemp.matchSize(operand) || 
                // If possible, default unknown sizes to 64
                mnemonic.defsTo64 && isNaN(operand.size))
                )
                continue mnemonicLoop;
            operand.implicit = mnemTemp.implicit;
        }

        found = true;
        break;
    }
    if(!found)
    {
        if(globalSize < 0) throw "Cannot infer opcode suffix";
        throw "Invalid operands";
    }


    // Finding the reg/rm/immediate operands
    if(mnemonic.operandTemplates.length > 0)
    {
        i = 0;
        if(mnemonic.vex)
        {
            vop = operands[mnemonic.vex.vop || 0];
            vop.implicit = true;
        }
        for(let op of mnemonic.operandTemplates)
        {
            op.fit(operands[i]);
            if(!op.implicit)
            {
                if(op.types.includes(OPT.MEM)) rm = operands[i];
                else if(op.types == OPT.IMM) imms.push(operands[i]);
                else reg = operands[i];
            }
            i++;
        }
    }

    if(globalSize == 64 && !mnemonic.defsTo64) rexVal |= 8, prefsToGen |= PREFIX_REX; // REX.W field
    
    let modRM = null, sib = null;
    if(mnemonic.e == REG_OP || mnemonic.e == REG_NON)
    {
        if(mnemonic.e == REG_OP && reg.reg >= 8) rexVal |= 1, prefsToGen |= PREFIX_REX;
    }
    else
    {
        let extraRex;
        if(mnemonic.e >= 0) reg = {reg: mnemonic.e}; // Sometimes the "reg" field is an opcode extension
        [extraRex, modRM, sib] = makeModRM(rm, reg);
        if(extraRex != 0) rexVal |= extraRex, prefsToGen |= PREFIX_REX;
    }

    // To encode ah/ch/dh/bh a REX prefix must not be present (otherwise they'll read as spl/bpl/sil/dil)
    if((prefsToGen & PREFIX_CLASHREX) == PREFIX_CLASHREX) throw "Can't encode high 8-bit register";

    // Update the global size in case the immediate was fit into an operand template
    if(singleImm) globalSize = operands[0].size;

    // Time to generate!
    if(prefsToGen & PREFIX_ADDRSIZE) this.genByte(0x67);
    if(globalSize == 16 && !mnemonic.defsTo16) this.genByte(0x66);
    if(mnemonic.prefix) this.genByte(mnemonic.prefix);
    if(mnemonic.vex) makeVexPrefix(mnemonic.vex, rexVal, vop).map(x => this.genByte(x));
    else
    {
        if(prefsToGen & PREFIX_REX) this.genByte(rexVal);
        // Generate the upper bytes of the opcode if needed
        if(mnemonic.opcode > 0xffff) this.genByte(mnemonic.opcode >> 16);
        if(mnemonic.opcode > 0xff) this.genByte(mnemonic.opcode >> 8);
    }
    this.genByte(mnemonic.opcode | (mnemonic.e == REG_OP ? reg.reg & 7 : 0));
    if(modRM != null) this.genByte(modRM);
    if(sib != null) this.genByte(sib);

    // Generating the displacement and immediate
    if(rm != null && rm.value != null)
    {
        this.genInteger(rm.value, rm.dispSize || 32);
    }
    for(let imm of imms) this.genInteger(imm.value, imm.size);
}

// Generate the ModRM byte
function makeModRM(rm, r)
{
    let modrm = 0, rex = 0, sib = null;

    // Encoding the "reg" field
    if(r.reg >= 8)
    {
        rex |= 4; // rex.R extension
        r.reg &= 7;
    }
    modrm |= r.reg << 3;

    // Special case for RIP-relative addressing
    if(rm.ripRelative)
    {
        modrm |= 5; // mod = 00, reg = (reg), rm = 101
        rm.value ||= 0n;
        return [rex, modrm, sib];
    }

    if(inferImmSize(rm.value) == 8) rm.dispSize = 8;

    // Encoding the "mod" (modifier) field
    if(rm.type != OPT.MEM) modrm |= 0xC0; // mod=11
    else if(rm.dispSize != 8 && rm.reg >= 0) modrm |= 0x80; // mod=10
    else if(rm.reg >= 0 && rm.value != null) modrm |= 0x40; // mod=01
    // else mod=00
    
    // Encoding the "rm" field
    if(rm.reg >= 8)
    {
        rex |= 1; // rex.B extension
        rm.reg &= 7;
    }

    // Encoding an SIB byte if necessary
    if(rm.reg2 >= 0 // If there's also an index register
        || rm.reg < 0 // If both registers are missing (it's just a displacement)
        )
    {
        if(rm.reg2 == 4) throw "Memory index cannot be RSP";
        if(rm.reg < 0)
        {
            // These are the respective "none" type registers
            rm.reg = 5;
            rm.reg2 = 4;
            rm.dispSize = 32; // Displacements on their own have to be of size 32
        }
        else if(rm.reg == 5) // Special case when the base is EBP
        {
            if(rm.value == null) modrm |= 0x40, rm.value = 0n;
            else if(rm.dispSize == 8) modrm |= 0x40, rm.dispSize = 8;
            else modrm |= 0x80;
        }

        if(rm.reg2 >= 8)
        {
            rex |= 2; // rex.X extension
            rm.reg2 &= 7;
        }
        sib |= rm.shift << 6;
        sib |= rm.reg2 << 3;
        sib |= rm.reg;
        modrm |= 4; // reg=100 signifies an SIB byte
    }
    else
    {
        if(rm.type == OPT.MEM) // Simple memory access with one register, e.g. (%rax)
        {
            if(rm.reg == 4) // Special case for ESP register (so as not to confuse with SIB)
            {
                sib = 0x24; // This encodes to base=ESP, index=none, scale=0
            }
            else if(rm.reg == 5 && (modrm & 0xC0) == 0) // Special case for EBP register (so as not to confuse with disp32)
            {
                modrm |= 0x40; // Set to mod=01, so the modrm will be interpreted as EBP+disp8
                sib = 0; // Bit of a hack - 0 doesn't actually go into SIB, it's a displacement value of 0
            }
        }
        modrm |= rm.reg;
    }


    return [rex, modrm, sib];
}


function makeVexPrefix(info, rex, extraOp)
{
    let
    byte1 = (~(rex & 7) << 5) // The first 3 fields are identical to the last 3 in rex (R, X, B), but inverted
            | info.map, // Then, the map/"implied leading opcode byte" (0F, 0F 38 or 0F 3A)
    byte2 = ((info.w !== undefined ? info.w : (rex & 8)) << 5) // Identical to rex.w
            | (extraOp ? ((~extraOp.reg & 15) << 3) : 0x78) // Inverted additional operand
            | (info.L !== undefined ? info.L << 2 : 0) // Vector size (0 is 128, 1 is 256)
            | info.PP; // "Implied mandatory prefix" (none, 66, F3 or F2)

    if((byte1 & 0x7F) == 0x61 && (byte2 & 0x80) == 0) // In certain cases, we can compress the prefix to 2 bytes
    {
        return [0xC5, byte2 | (byte1 & 0x80)];
    }
    return [0xC4, byte1, byte2];
}