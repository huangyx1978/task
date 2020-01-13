import {Token} from './token';
import {Char} from './char';

export type log = (log?: string) => boolean;

export class TokenStream {
    private bracket: boolean;
    private buffer: string;
    private p: number;
    private len: number;
    private cur: number;                // 当前char code
    
    log: log;
    dec: number;                // 数字值
    isInteger: boolean;         // 表示解析出来的数字是整数
    _var: string;
    varBrace: boolean;                  // 带[]的字段名
    lowerVar: string;
    text: string; 
    token: Token;

    LastP: number;                  // 上一个符号的开始位置
    line: number;                // 当前行号
    at: number;                 // 当前字符
    prevLine: number;
    prevAt: number;
    startLine: number;
    startAt: number;
    PrevToken: Token;

    file: string;

    constructor(log:log, input: string, options?:{bracket:boolean})
    {
        if (options !== undefined) this.bracket = options.bracket;
        this.log = log;
        this.LastP = 1;
        this.buffer = input;
        this.len = input.length;
        this.p = 0;
        this.at = 0;
        this.line = 0;
        this.advance();
    }

    getSourceAt(pos:number):string {
        return this.buffer.substring(pos, this.LastP-1);
    }

    getSourceNearby(sourceAt:number): string {
        return ' ...' + this.buffer.substr(sourceAt, 50) + '... ';
    }

    private errorAt() {
        let line = this.startLine+1;
        let charAt = this.startAt + 1;
        return this.file + ' 错误在'+line+'行'+charAt+'列: \n' + this.getSourceNearby(this.p) + '\n';
    }

    error(...msg:string[]) {
        let err = this.errorAt()+msg.join('');
        this.log(err);
        throw err;
    }

    expectToken(...tokens:Token[]) {
        let err = this.errorAt()+'应该是'+tokens.map(v => Token[v]).join('或');
        this.log(err);
        throw err;
    }

    expect(...msg:string[]) {
        let err = this.errorAt() + '应该是'+msg.join('或');
        this.log(err);
        throw err;
    }

    assertToken(token: Token) {
        if (this.token !== token) this.expectToken(token);
    }

    assertVar() {
        if (this.token !== Token.VAR) this.expect('应该是变量名');
    }

    assertKey(key: string) {
        if (this.lowerVar !== key || this.varBrace === true) this.expect(key);
    }

    private advance() {
        this.cur = (this.p >= this.len) ? 0 : this.buffer.charCodeAt(this.p++);
        if (this.cur == Char.ENTER)
        {
            this.line++;
            this.at = 1;
        }
        else
            this.at++;
    }

    isKeyword(key:string):boolean {
        //if (this.token !== Token._VAR) return false;
        //if (this.varBrace === true) return false;
        return this.lowerVar === key && this.varBrace === false;
    }

    isKeywords(keys:string[]):boolean {
        //if (this.token !== Token._VAR) return false;
        //if (this.varBrace === true) return false;
        if (this.varBrace === true) return false;
        return keys.indexOf(this.lowerVar)>=0;
    }

    /*
    // Mainly for xml parser using
    ReadTo(to:number)
    {
        // There are 5 predefined entity references in XML:
        // &lt; < less than 
        // &gt; > greater than 
        // &amp; & ampersand  
        // &apos; ' apostrophe 
        // &quot; " quotation mark 

        this.token = Token.LT;
        if (this.cur == to)
        {
            this.text = null;
            return;
        }
        let pos = this.p;
        StringBuilder sb = new StringBuilder(32);
        while (this.cur != to)
        {
            if (this.cur == '&')
            {
                int andPos = this.p;
                this.Advance();
                for (;;)
                {
                    if (this.cur == Char.NULL) this.ThrowException("& not end");
                    if (this.cur == ';')
                    {
                        if (this.AndCompare(andPos, "lt")) sb.Append('<');
                        else if (this.AndCompare(andPos, "gt")) sb.Append('>');
                        else if (this.AndCompare(andPos, "amp")) sb.Append('&');
                        else if (this.AndCompare(andPos, "apos")) sb.Append('\'');
                        else if (this.AndCompare(andPos, "quot")) sb.Append('"');
                        else this.ThrowException("error &");
                        this.Advance();
                        break;
                    }
                    this.Advance();
                }
            }
            else if (this.cur == Char.NULL)
            {
                this.token = Token._FINISHED;
                this.text = sb.ToString();
                return;
            }
            else
            {
                sb.Append(this.cur);
            }
            this.Advance();
        }
        this.Advance();
        this.text = sb.ToString();
    }
    AndCompare(andPos:number, andToken:string): boolean
    {
        let len = andToken.length;
        return (string.Compare(this.buffer, andPos, andToken, 0, len, true) == 0 && this.p - andPos == len);
    }
    */
    showToken() {
        return Token[this.token];
    }

    PeekToken(): Token
    {
        let prevToken:Token = this.PrevToken;
        let cur = this.cur;
        let _var = this._var;
        let lowerVar = this.lowerVar;
        let lastP = this.LastP;
        let lastLineNum = this.startLine;
        let lastChatAt = this.startAt;
        let token = this.token;
        let p = this.p;
        let lineNum = this.line;
        let charAt = this.at;
        this.readToken();
        let ret = this.token;
        this.PrevToken = prevToken;
        this.LastP = lastP;
        this.startLine = lastLineNum;
        this.startAt = lastChatAt;
        this.token = token;
        this._var = _var;
        this.lowerVar = lowerVar;
        this.p = p;
        this.line = lineNum;
        this.at = charAt;
        this.cur = cur;
        return ret;
    }

    readToken()
    {
        this.PrevToken = this.token;
        this.LastP = this.p;
        this.prevLine = this.startLine;
        this.prevAt = this.startAt;
        this.startLine = this.line;
        this.startAt = this.at;
        //this.prevSpace = false;
        this._var = undefined;
        this.lowerVar = undefined;
        for (; ; )
        {
            switch (this.cur)
            {
                case Char.NULL:
                    this.token = Token._FINISHED;
                    break;
                case Char.TAB:
                case Char.SPACE:
                case Char.USPACE:       // 中文空格
                case Char._R:
                case Char.ENTER:
                    this.advance();
                    this.startLine = this.line;
                    this.startAt = this.at;
                    this.LastP = this.p;
                    //this.prevSpace = true;
                    continue;
                case Char.PLUS: 
                    this.token = Token.ADD; this.advance(); 
                    if (this.cur === Char.EQU) {
                        this.token = Token.ADDEQU;
                        this.advance();
                    }
                    break;
                case Char.MINUS:
                    this.advance();
                    switch (this.cur)
                    {
                        case Char.EQU:
                            this.token = Token.SUBEQU;
                            this.advance();
                            break;
                        case Char.MINUS: this.readLineRemark(); continue;
                        default: this.token = Token.SUB; break;
                    }
                    break;
                case Char.STAR: this.token = Token.MUL; this.advance(); break;
                case Char.DOLLAR:
                    //this.advance();
                    this.readVar();
                    if (this._var === '$')
                        this.token = Token.DOLLAR;
                    else
                        this.token = Token.DOLLARVAR;
                    break;
                case Char.AT: this.token = Token.AT; this.advance(); break;
                case Char.SLASH:
                    this.advance();
                    switch (this.cur)
                    {
                        case Char.SLASH: this.readLineRemark(); continue;
                        case Char.STAR: this.readRemark(); continue;
                        case Char.MINUS: this.readInlineCode(); break;
                        default: this.token = Token.DIV; break;
                    }
                    break;
                case Char.PERCENT: this.token = Token.MOD; this.advance(); break;
                case Char.LParenthese: this.token = Token.LPARENTHESE; this.advance(); break;
                case Char.RParenthese: this.token = Token.RPARENTHESE; this.advance(); break;
                case Char.LBrace:
                    this.advance();
                    this.token = Token.LBRACE; break;
                    //if (this.cur != Char.LBrace) { this.token = Token.LBRACE; break; }
                    //this.advance(); this.ReadInline(); break;
                case Char.RBrace: this.token = Token.RBRACE; this.advance(); break;
                case Char.SHARP: this.token = Token.SHARP; this.advance(); break;
                case Char.DOT: this.token = Token.DOT; this.advance(); break;
                case Char.COMMA: this.token = Token.COMMA; this.advance(); break;
                case Char.SEMICOLON: this.token = Token.SEMICOLON; this.advance(); break;
                case Char.COLON: this.token = Token.COLON; this.advance(); break;
                case Char.TOPANGLE: this.token = Token.XOR; this.advance(); break;
                case Char.EQU:
                    this.advance();
                    switch (this.cur)
                    {
                        case Char.GT: this.token = Token.GE; this.advance(); break;
                        case Char.LS: this.token = Token.LE; this.advance(); break;
                        default: this.token = Token.EQU; break;
                    }
                    break;
                case Char.GT:
                    this.advance();
                    switch (this.cur)
                    {
                        case Char.EQU: this.token = Token.GE; this.advance(); break;
                        case Char.LS: this.token = Token.NE; this.advance(); break;
                        default: this.token = Token.GT; break;
                    }
                    break;
                case Char.LS:
                    this.advance();
                    switch (this.cur)
                    {
                        case Char.EQU: this.token = Token.LE; this.advance(); break;
                        case Char.GT: this.token = Token.NE; this.advance(); break;
                        default: this.token = Token.LT; break;
                    }
                    break;
                case Char.AND:
                    this.advance();
                    this.token = Token.BITWISEAND;
                    break;
                case Char.OR:
                    this.advance();
                    this.token = Token.BITWISEOR;
                    break;
                case Char.LBracket:
                    if (this.bracket === true) {
                        this.token = Token.LBRACKET; this.advance(); break;
                    }
                    this.readSquareVar();
                    break;
                case Char.RBracket:
                    if (this.bracket === true) {
                        this.token = Token.RBRACKET; this.advance(); break;
                    }
                    this.error("unexpected ]");
                    break;
                case Char.Apostrophe:   // '
                    this.readString(Char.Apostrophe); // 字符串
                    break;
                case Char.QUOT:         // "
                    this.readString(Char.QUOT); // 字符串
                    break;
                case Char.UNDERLINE:    // _
                    this.readVar();
                    //this.FindToken(toFindKeyToken);
                    break;
                default:
                    if (this.cur >= Char.ZERO && this.cur <= Char.NINE) 
                        this.readNumber(this.cur - Char.ZERO);
                    else if (this.cur>=Char.a && this.cur<=Char.z ||
                        this.cur>=Char.A && this.cur<=Char.Z ||
                        this.cur>=0x100)
                        this.readVar();
                    else                        
                        this.error("PARSE_UnexpectChar");
                    break;
            }
            return;
        }
    }

    private readLineRemark()
    {
        while (true)
        {
            this.advance();
            switch (this.cur)
            {
                case Char._R:
                case Char.ENTER:
                case Char.NULL: return;
            }
        }
    }

    private readInlineCode() {
        this.token = Token.CODE;
        let start = this.p;
        while (true) {
            this.advance();
            if (this.cur === Char.NULL) break;
            if (this.cur === Char.MINUS) {
                this.advance();
                if (this.cur === Char.SLASH) {
                    this.advance();
                    break;
                }
            }
        }
        this.text = this.buffer.substring(start, this.p - 3);
    }

    private readRemark()
    {
        this.advance();
        while (true)
        {
            if (this.cur === Char.NULL) break;
            if (this.cur === Char.STAR)
            {
                this.advance();
                if (this.cur == Char.SLASH)
                {
                    this.advance();
                    break;
                }
            }
            else {
                this.advance();
            }
        }
    }

    private readSquareVar()
    {
        let start = this.p;
        for (; ; )
        {
            this.advance();
            switch (this.cur)
            {
                case Char.NULL:
                case Char._R:
                case Char.ENTER:
                    this.error("PARSE_UnexpectEndVar");
                    return;
                case Char.RBracket:
                    this.token = Token.VAR;
                    this.varBrace = true;
                    this._var = this.buffer.substring(start, this.p - 1);
                    this.lowerVar = this._var.toLowerCase();
                    this.advance();
                    return;
            }
        }
    }

    private readNumber(firstDigit:number)
    {
        this.dec = firstDigit;
        this.isInteger = true;
        this.advance();
        if (firstDigit == 0 && ( this.cur === Char.x || this.cur === Char.X))
        {
            this.token = Token.HEX;
            this.advance();
            this.text = '';
            for (; ; )
            {
                if (this.cur >= Char.ZERO && this.cur <= Char.NINE ||
                    this.cur >= Char.a && this.cur <= Char.f ||
                    this.cur >= Char.A && this.cur <= Char.F)
                    this.text += String.fromCharCode(this.cur);
                else break;
                this.advance();
            }
            return;
        }
        this.token = Token.NUM;
        for (; ; )
        {
            if (this.cur >= Char.ZERO && this.cur <= Char.NINE)
            {
                this.dec = this.dec * 10 + (this.cur - Char.ZERO);
            }
            else if (this.cur === Char.DOT)
            {
                this.isInteger = false;
                let rate = 0.1;
                for (; ; )
                {
                    this.advance();
                    if (this.cur >= Char.ZERO && this.cur <= Char.NINE)
                    {
                        this.dec = this.dec + (this.cur - Char.ZERO) * rate;
                        rate /= 10;
                    }
                    else return;
                }
            }
            else break;
            this.advance();
        }
    }

    private readString(quote:number)
    {
        this.token = Token.STRING;
        let start = this.p;
        //StringBuilder sb = new StringBuilder(100);
        this.advance();
        while (true)
        {
            if (this.cur == Char.NULL) return;
            if (this.cur == quote)
            {
                this.text = this.buffer.substring(start, this.p-1);
                this.advance();
                return;
            }
            if (this.cur === Char.BACKSLASH)
            {
                this.advance();
                if (this.cur == quote) { this.advance(); break; }
                /*
                switch (this.cur)
                {
                    case Char.BACKSLASH: sb.Append(Char.BACKSLASH); this.Advance(); break;
                    case Char.T: sb.Append(Char.TAB); this.Advance(); break;
                    case Char.R: sb.Append(Char._R); this.Advance(); break;
                    case Char.N: sb.Append(Char.ENTER); this.Advance(); break;
                    default: this.ThrowException("PARSE_UnknownEscape"); break;
                }*/
                continue;
            }
            this.advance();
        }
    }

    private readVar()
    {
        let start = this.p - 1;
        let loop = true;
        while (loop)
        {
            this.advance();
            if (this.cur == Char.NULL)
            {
                this._var = this.buffer.substring(start, this.p-1);
                this.lowerVar = this._var.toLowerCase();
                this.varBrace = false;
                return;
            }
            switch (this.cur)
            {
                case Char.UNDERLINE:
                    break;
                default:
                    if (this.cur>=Char.ZERO && this.cur<=Char.NINE ||
                        this.cur>=Char.a && this.cur<=Char.z ||
                        this.cur>=Char.A && this.cur<=Char.Z ||
                        this.cur>=0x100)
                        continue;
                    loop = false;
                    break;
            }
        }
        this.token = Token.VAR;
        this._var = this.buffer.substring(start, this.p-1);
        this.lowerVar = this._var.toLowerCase();
        this.varBrace = false;
    }
}
