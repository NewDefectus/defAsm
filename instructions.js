const MAX_INSTR_SIZE = 15; // Instructions are guaranteed to be at most 15 bytes

function Instruction()
{
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

/* Indicate that the instruction requires a label to generate
(resolveFunc is what should be done when this dependency is resolved) */
Instruction.prototype.addLabelDependency = function(labelName, resolveFunc)
{
    this.requiredLabel = labelName;
    this.labelResolve = resolveFunc;
}

function parseInstruction(opcode)
{
    let operand = null, globalSize = -1, hasRex = null, rexVal = 0x40, enforceSize = false;
    let prefsToGen = new Set();
    let reg = null, rm = null, imm = null;
    let result = new Instruction();

    if(prefixes.hasOwnProperty(opcode))
    {
        result.genByte(prefixes[opcode]);
        ungetToken(token);
        token = ';';
        return result;
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
    let variations = mnemonics[opcode], operands = [], hateRex = false;

    while(token != ';' && token != '\n')
    {
        operand = new Operand(globalSize);
        if(token == ':') // Segment specification for addressing
        {
            if(operand.type != OPT.SEG)
                throw "Incorrect prefix";
            prefsToGen.add([0x26, 0x2E, 0x36, 0x3E, 0x64, 0x65][operand.reg])
            next();
            operand = new Operand();
            if(operand.type != OPT.MEM)
                throw "Segment prefix must be followed by memory reference";
        }

        operands.push(operand);
        for(let p of operand.prefixRequests)
        {
            if(!isNaN(p))
                prefsToGen.add(p);
            else if(p == "NO REX")
                hateRex = true;
            else if(p.startsWith("REX"))
            {
                hasRex = true;
                if(p[3] == '.')
                {
                    rexVal |= ({R: 4, X: 2, B: 1})[p[4]];
                }
            }
        }

        // Infer default size from register operands
        if(globalSize < 0 && operand.size > 0 && (operand.type == OPT.REG || operand.type == OPT.SEG)) globalSize = operand.size;

        if(token != ',') break;
        next();
    }

    //console.log(operands);
    if(globalSize < 0)
    {
        // If there's just one operand and it's an immediate, the overall size is the inferred size
        if(operands.length == 1 && operands[0].type == OPT.IMM) globalSize = operands[0].size;
        else throw "Cannot infer operand size";
    }
    for(let o of operands)
    {
        if(o.size < 0 // Unknown sizes (e.g. memory) default to the global size
        || (o.type == OPT.IMM && o.size > globalSize) // Reduce immediates to global size (downcast only)
        || enforceSize) // If a suffix has been entered, it applies on all operands
            o.size = globalSize;
    }

    let i, mnemonic, found = false;

    mnemonicLoop:
    for(mnemonic of variations)
    {
        if(mnemonic.operandTemplates.length != operands.length) continue;
        for(i = 0; i < operands.length; i++)
            if(!mnemonic.operandTemplates[i].match(operands[i])) continue mnemonicLoop;

        found = true;
        break;
    }
    if(!found) throw "Invalid operands";



    // Finding the reg/rm/immediate operands
    if(mnemonic.operandTemplates.length > 0)
    {
        i = 0;
        for(let op of mnemonic.operandTemplates)
        {
            op.fit(operands[i]);
            if(op.types == OPT.RM || op.types == OPT.MEM) rm = operands[i];
            else if(op.types == OPT.IMM) imm = operands[i];
            else if(op.types == OPT.REG || op.types == OPT.SEG) reg = operands[i];
            i++;
        }
    }

    if(globalSize == 64 && mnemonic.defsTo64 !== true) rexVal |= 8, hasRex = true;
    
    let extraRex, modRM = null, sib = null;
    if(mnemonic.e == REG_OP || mnemonic.e == REG_NON)
    {
        if(mnemonic.e == REG_OP && reg.reg >= 8) rexVal |= 1, hasRex = true;
    }
    else
    {
        if(mnemonic.e >= 0) reg = {reg: mnemonic.e}; // Sometimes the "reg" field is an opcode extension
        [extraRex, modRM, sib] = makeModRM(rm, reg);
        if(extraRex != 0) rexVal |= extraRex, hasRex = true;
    }

    // To encode ah/ch/dh/bh a REX prefix must not be present (otherwise they'll read as spl/bpl/sil/dil)
    if(hasRex && hateRex) throw "Can't encode high 8-bit register";

    // Time to generate!
    for(let pref of prefsToGen) result.genByte(pref);
    if(globalSize == 16) result.genByte(0x66);
    if(hasRex) result.genByte(rexVal);
    if(mnemonic.opcode > 0xff) result.genByte(mnemonic.opcode >> 8); // Generate the upper byte of the opcoded if needed
    result.genByte(mnemonic.opcode | (mnemonic.e == REG_OP ? reg.reg & 7 : 0));
    if(modRM != null) result.genByte(modRM);
    if(sib != null) result.genByte(sib);

    // Generating the displacement and immediate
    if(rm != null && rm.value != null)
    {
        result.genInteger(rm.value, rm.dispSize || 32);
    }
    if(imm) result.genInteger(imm.value, imm.size);

    return result;
}

// Generate the ModRM byte
function makeModRM(rm, r)
{
    let modrm = 0, rex = 0, sib = null;

    if(inferImmSize(rm.value) == 8) rm.dispSize = 8;

    // Encoding the "mod" (modifier) field
    if(rm.type == OPT.REG) modrm |= 0xC0; // mod=11
    else if(rm.dispSize != 8 && rm.reg >= 0) modrm |= 0x80; // mod=10
    else if(rm.reg >= 0 && rm.value != null) modrm |= 0x40; // mod=01
    // else mod=00

    // Encoding the "reg" field
    if(r.reg >= 8)
    {
        rex |= 4; // rex.R extension
        r.reg &= 7;
    }
    modrm |= r.reg << 3;
    
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
    else // Simple memory access with one register, e.g. (%rax)
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
        modrm |= rm.reg;
    }


    return [rex, modrm, sib]
}