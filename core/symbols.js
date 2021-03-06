import { Expression, LabelExpression } from "./shuntingYard.js";
import { next, ParserError } from "./parser.js";
import { symbols } from "./compiler.js";
import { Statement } from "./statement.js";

export var recompQueue = [];

export function queueRecomp(instr)
{
    if(!instr.wantsRecomp)
        recompQueue.push(instr);
    instr.wantsRecomp = true;
}

export class Symbol extends Statement
{
    constructor(prev, name, namePos, isLabel = false)
    {
        super(prev, 0);
        this.name = name;
        try
        {
            this.expression = isLabel ? LabelExpression(this) : (next(), new Expression(this));
            this.value = this.expression.evaluate(this.address);
        }
        catch(e)
        {
            this.removed = true;
            throw e;
        }

        if(symbols.has(name))
        {
            let record = symbols.get(name);
            if(record.symbol)
            {
                this.error = new ParserError(`This ${isLabel ? 'label' : 'symbol'} already exists`, namePos);
                this.duplicate = true;
                record.references.push(this);
            }
            else
            {       
                record.symbol = this;
                this.duplicate = false;
                for(let ref of record.references)
                {
                    if(!ref.removed)
                        queueRecomp(ref);
                }
            }
        }
        else
            symbols.set(name, {
                symbol: this,
                references: []
            });
    }

    recompile()
    {
        let record = symbols.get(this.name);
        if(this.duplicate && record.symbol)
            return;
        this.duplicate = false;

        let originValue = this.error ? null : this.value;
        this.error = null;

        try
        {
            this.value = this.expression.evaluate(this.address, true);
        }
        catch(e)
        {
            this.error = e;
        }

        if(originValue !== (this.error ? null : this.value))
        {
            record.symbol = this;
            for(let ref of record.references)
                queueRecomp(ref);
        }
    }
}