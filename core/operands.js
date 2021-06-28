import { token, next, ungetToken, ParserError, codePos, currSyntax } from "./parser.js";
import { Expression, operators } from "./shuntingYard.js";

// Operand types
export const OPT = {
REG:    1,  // General-purpose register (8/64-bit) - ax, bl, esi, r15, etc.
VEC:    2,  // Vector register (64/512-bit) - %mm0 / %mm7, %xmm0 / %xmm15, %ymm0 / %ymm15, %zmm0 / %zmm15
VMEM:   3,  // Vector memory - e.g. (%xmm0)
IMM:    4,  // Immediate value - e.g. $20
MASK:   5,  // Mask register (64-bit) - %k0 / %k7
REL:    6,  // Relative address - memory that consists of only an address (may be converted to MEM)
MEM:    7,  // Memory operand - e.g. (%rax)
ST:     8,  // Floating-point stack register (80-bit) - %st(0) / %st(7)
SEG:    9,  // Segment register (16-bit) - %cs, %ds, %es, %fs, %gs, %ss
IP:     10, // Instruction pointer register (only used in memory) - %eip or %rip
BND:    11, // Bound register (128-bit) - %bnd0 / %bnd3
CTRL:   12, // Control register (64-bit) - %cr0, %cr2, %cr3, %cr4 and %cr8
DBG:    13  // Debug register (64-bit) - %dr0 / %dr7
};

export const registers = Object.assign({}, ...[
"al","cl","dl","bl","ah","ch","dh","bh",
"ax","cx","dx","bx","sp","bp","si","di",
"eax","ecx","edx","ebx","esp","ebp","esi","edi",
"rax","rcx","rdx","rbx","rsp","rbp","rsi","rdi",
"es","cs","ss","ds","fs","gs",
"st","rip","eip","spl","bpl","sil","dil"
].map((x, i) => ({[x]: i})));

export const suffixes = {"b": 8, "w": 16, "l": 32, "d": 32, "q": 64, "t": 80, "x": 128, "y": 256, "z": 512};
export const sizePtrs = {"byte": 8, "word": 16, "dword": 32, "qword": 64, "tbyte": 80, "oword": 128, "xmmword": 128, "ymmword": 256, "zmmword": 512};

export const    PREFIX_REX = 1,
                PREFIX_NOREX = 2,
                PREFIX_CLASHREX = 3,
                PREFIX_ADDRSIZE = 4,
                PREFIX_SEG = 8;

export var regParsePos;

export function isRegister(reg)
{
    reg = reg.toLowerCase();
    if(registers.hasOwnProperty(reg))
        return true;
    if(reg[0] === 'r')
    {
        reg = reg.slice(1);
        if(parseInt(reg) >= 0 && parseInt(reg) < 16 && (!isNaN(reg) || suffixes[reg[reg.length - 1]]))
            return true;
    }
    else
    {
        let max = 32;
        if(reg.startsWith("mm") || reg.startsWith("dr")) reg = reg.slice(2), max = 8;
        else if(reg.startsWith("cr")) reg = reg.slice(2), max = 9;
        else if(reg.startsWith("xmm") || reg.startsWith("ymm") || reg.startsWith("zmm")) reg = reg.slice(3);
        else if(reg.startsWith("bnd")) reg = reg.slice(3), max = 4;
        else if(reg[0] == 'k') reg = reg.slice(1), max = 8;
        else return false;
        if(!isNaN(reg) && (reg = parseInt(reg), reg >= 0 && reg < max))
            return true;
    }
    return false;
}

export function parseRegister(expectedType = null)
{
    let reg = registers[(currSyntax.prefix ? next() : token).toLowerCase()];
    let size = 0, type = -1, prefs = 0;
    if(reg >= registers.al && reg <= registers.rdi)
    {
        type = OPT.REG;
        size = 8 << (reg >> 3);
        if(size == 8 && reg >= registers.ah && reg <= registers.bh)
            prefs |= PREFIX_NOREX;
        reg &= 7;
    }
    else if(reg >= registers.mm0 && reg <= registers.mm7)
    {
        type = OPT.MMX;
        size = 64;
        reg -= registers.mm0;
    }
    else if(reg >= registers.xmm0 && reg <= registers.xmm7)
    {
        type = OPT.SSE;
        size = 128;
        reg -= registers.xmm0;
    }
    else if(reg >= registers.es && reg <= registers.gs)
    {
        type = OPT.SEG;
        size = 32; // Dunno what the actual size of the seg registers is, but this'll prevent the word prefix
        reg -= registers.es;
    }
    else if(reg === registers.st)
    {
        type = OPT.ST;
        reg = 0;
        if(next() == '(')
        {
            reg = parseInt(next());
            if(isNaN(reg) || reg >= 8 || reg < 0 || next() != ')')
                throw new ParserError("Unknown register");
        }
        else ungetToken();
    }
    else if(reg === registers.rip || reg === registers.eip)
    {
        if(expectedType == null || !expectedType.includes(OPT.IP))
            throw new ParserError(`Can't use %${reg === registers.eip ? 'e' : 'r'}ip here`);
        type = OPT.IP;
        size = reg == registers.eip ? 32 : 64;
        reg = 0;
    }
    else if(reg >= registers.spl && reg <= registers.dil)
    {
        type = OPT.REG;
        size = 8;
        prefs |= PREFIX_REX;
        reg -= registers.spl - 4;
    }
    else if(token[0] === 'r') // Attempt to parse the register name as a numeric (e.g. r10)
    {
        reg = parseInt(token.slice(1));
        if(isNaN(reg) || reg < 0 || reg >= 16)
            throw new ParserError("Unknown register");
        type = OPT.REG;

        size = suffixes[token[token.length - 1]] || 64;
    }
    else
    {
        let max = 32;
        if(token.startsWith("bnd")) reg = token.slice(3), type = OPT.BND, max = 4;
        else if(token[0] == 'k') reg = token.slice(1), type = OPT.MASK, max = 8, size = NaN;
        else if(token.startsWith("dr")) reg = token.slice(2), type = OPT.DBG, max = 8;
        else if(token.startsWith("cr")) reg = token.slice(2), type = OPT.CTRL, max = 9;
        else
        {
            type = OPT.VEC;
            if(token.startsWith("mm")) reg = token.slice(2), size = 64, max = 8;
            else if(token.startsWith("xmm")) reg = token.slice(3), size = 128;
            else if(token.startsWith("ymm")) reg = token.slice(3), size = 256;
            else if(token.startsWith("zmm")) reg = token.slice(3), size = 512;
            else throw new ParserError("Unknown register");
        }

        if(isNaN(reg) || !(reg = parseInt(reg), reg >= 0 && reg < max)) throw new ParserError("Unknown register");
    }
    
    if(expectedType !== null && expectedType.indexOf(type) < 0) throw new ParserError("Invalid register");
    
    regParsePos = codePos;
    next();
    return [reg, type, size, prefs];
}


/** @param {Instruction} instr */
export function Operand(instr, forceImmToRel = false)
{
    this.reg = this.reg2 = -1;
    this.shift = 0;
    this.value = null;
    this.type = null;
    this.size = NaN;
    this.prefs = 0;
    this.attemptedSizes = 0;
    this.attemptedUnsignedSizes = 0;

    this.startPos = codePos;
    let indirect = token === '*';
    if(indirect) next();

    if(instr.syntax.prefix && isRegister(token))
        throw new ParserError("Registers must be prefixed with '%'");

    if(instr.syntax.prefix ? token === '%' : isRegister(token)) // Register
    {
        [this.reg, this.type, this.size, this.prefs] = parseRegister();
        this.endPos = regParsePos;
    }
    else
    {
        if(instr.syntax.intel)
        {
            this.type = forceImmToRel ? OPT.REL : OPT.IMM;
            if(token !== '[')
            {
                let mayBeRel = true;
                if(token.toLowerCase() === 'offset')
                {
                    next();
                    this.type = OPT.IMM;
                    mayBeRel = false;
                }
                this.expression = new Expression(instr, 0, true);
                this.value = this.expression.evaluate(instr.address);

                if(mayBeRel && this.expression.hasSymbols)
                    this.type = OPT.REL;
            }

            // Intel syntax
            if(token === '[') // Memory
            {
                this.type = OPT.MEM;
                next();
                if(instr.syntax.prefix ? token != '%' : !isRegister(token))
                {
                    let secExpr = new Expression(instr, 0, true);
                    if(this.expression) // Combining the first and second expressions
                    {
                        this.expression.stack.push(...secExpr.stack, operators['+']);
                        this.expression.floatPrec = Math.max(this.expression.floatPrec, secExpr.floatPrec);
                        this.expression.hasSymbols = this.expression.hasSymbols || secExpr.hasSymbols;
                        this.value = this.expression.evaluate(instr.address);
                    }
                    else
                    {
                        this.expression = secExpr;
                        this.value = this.expression.evaluate(instr.address);
                    }
                    if(token == ']')
                    {
                        next();
                        return;
                    }
                }

                if(instr.syntax.prefix && token != '%')
                    throw new ParserError("Expected register");

                [this.reg, tempType, tempSize] = parseRegister([OPT.REG, OPT.IP, OPT.VEC]);

                if(tempType === OPT.VEC)
                {
                    this.type = OPT.VMEM; this.size = tempSize;
                    if(tempSize < 128) throw new ParserError("Invalid register size", regParsePos);
                    this.reg2 = this.reg;
                    this.reg = -1;
                }
                else
                {
                    if(tempSize === 32) this.prefs |= PREFIX_ADDRSIZE;
                    else if(tempSize !== 64) throw new ParserError("Invalid register size", regParsePos);
                    if(tempType === OPT.IP) this.ripRelative = true;
                    else if(token === '+')
                    {   
                        next();
                        if(instr.syntax.prefix && token != '%')
                            throw new ParserError("Expected register");

                        [this.reg2, tempType, tempSize] = parseRegister([OPT.REG, OPT.VEC]);
                        if(tempType === OPT.VEC)
                        {
                            this.type = OPT.VMEM; this.size = tempSize;
                            if(tempSize < 128) throw new ParserError("Invalid register size", regParsePos);
                        }
                        else
                        {
                            if(this.reg2 === 4) throw new ParserError("Memory index cannot be RSP", regParsePos);
                            if(tempSize === 32) this.prefs |= PREFIX_ADDRSIZE;
                            else if(tempSize !== 64) throw new ParserError("Invalid register size", regParsePos);
                        }

                        if(token === '*')
                        {
                            this.shift = "1248".indexOf(next());
                            if(this.shift < 0) throw new ParserError("Scale must be 1, 2, 4, or 8");
                            next();
                        }
                    }
                }

                if((this.reg & 7) === 5) this.value = this.value || 0n; 
                if(token !== ']') throw new ParserError("Expected ']'");
                next();
            }
        }
        else
        {
            // AT&T syntax
            if(token === '$') // Immediate
            {
                next();
                this.expression = new Expression(instr);
                this.value = this.expression.evaluate(instr.address);
                this.type = OPT.IMM;
            }
            else // Address
            {
                this.type = OPT.MEM;
                this.expression = new Expression(instr, 0, true);
                this.value = this.expression.evaluate(instr.address);
                if(token !== '(')
                {
                    if(!indirect)
                    {
                        this.type = OPT.REL;
                        this.endPos = codePos;
                    }
                    return;
                }

                let tempSize, tempType;
                if(instr.syntax.prefix ? next() === '%' : isRegister(next())) [this.reg, tempType, tempSize] = parseRegister([OPT.REG, OPT.IP, OPT.VEC]);
                else if(token === ',')
                {
                    this.reg = -1;
                    tempType = -1;
                    tempSize = 64;
                }
                else throw new ParserError("Expected register");
                
                if(tempType === OPT.VEC)
                {
                    this.type = OPT.VMEM; this.size = tempSize;
                    if(tempSize < 128) throw new ParserError("Invalid register size", regParsePos);
                    this.reg2 = this.reg;
                    this.reg = -1;
                }
                else
                {
                    if(tempSize === 32) this.prefs |= PREFIX_ADDRSIZE;
                    else if(tempSize !== 64) throw new ParserError("Invalid register size", regParsePos);
                    if(tempType === OPT.IP) this.ripRelative = true;
                    else if(token === ',')
                    {
                        if(instr.syntax.prefix ? next() !== '%' : !isRegister(next())) throw new ParserError("Expected register");
                        [this.reg2, tempType, tempSize] = parseRegister([OPT.REG, OPT.VEC]);
                        if(tempType === OPT.VEC)
                        {
                            this.type = OPT.VMEM; this.size = tempSize;
                            if(tempSize < 128) throw new ParserError("Invalid register size", regParsePos);
                        }
                        else
                        {
                            if(this.reg2 === 4) throw new ParserError("Memory index cannot be RSP", regParsePos);
                            if(tempSize === 32) this.prefs |= PREFIX_ADDRSIZE;
                            else if(tempSize !== 64) throw new ParserError("Invalid register size", regParsePos);
                        }

                        if(token === ',')
                        {
                            this.shift = "1248".indexOf(next());
                            if(this.shift < 0) throw new ParserError("Scale must be 1, 2, 4, or 8");
                            next();
                        }
                    }
                    else if(this.reg === 4) this.reg2 = 4;
                }
                if((this.reg & 7) === 5) this.value = this.value || 0n; 
                if(token !== ')') throw new ParserError("Expected ')'");
                next();
            }
        }
    }
}

Operand.prototype.sizeAllowed = function(size, unsigned = false)
{
    return size >= (unsigned ? this.unsignedSize : this.size) || this.sizeAvailable(size, unsigned);
}
Operand.prototype.sizeAvailable = function(size, unsigned = false)
{
    return !((unsigned ? this.attemptedUnsignedSizes : this.attemptedSizes) & 1 << (size >> 4));
}
Operand.prototype.recordSizeUse = function(size, unsigned = false)
{
    if(unsigned)
        this.attemptedUnsignedSizes |= 1 << (size >> 4);
    else
        this.attemptedSizes |= 1 << (size >> 4);
}