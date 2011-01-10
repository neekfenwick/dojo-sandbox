/*
Real JS Beautifier (c) Vital

http://my.opera.com/Vital/blog/2007/11/21/javascript-beautify-on-javascript-translated

Based on JS Beautifier

(c) 2007, Einars "elfz" Lielmanis

http://elfz.laacz.lv/beautify/


You are free to use this in any way you want, in case you find this useful or working for you.

Usage:
    js_beautify(js_source_text);

*/

definize([
'IN_EXPR',
'IN_BLOCK',


'TK_UNKNOWN',
'TK_WORD',
'TK_START_EXPR',
'TK_END_EXPR',
'TK_START_BLOCK',
'TK_END_BLOCK',
'TK_END_COMMAND',
'TK_EOF',
'TK_STRING',

'TK_BLOCK_COMMENT',
'TK_COMMENT',

'TK_OPERATOR',

// internal flags
'PRINT_NONE',
'PRINT_SPACE',
'PRINT_NL'
]);

function definize(input)
{
  for (var i=0;i<input.length;i++) eval(input[i]+'='+(i+1));
}

var output, token_text, last_type, _in, ins, _indent, tab_string, is_last_nl;
var input, input_length;

function js_beautify(js_source_text, tab_size, tab_character)
{
    //global $output, $token_text, $last_type, $last_text, $in, $ins, $indent, $tab_string;


    //global $input, $input_length;
    tab_size = tab_size || 4; tab_character = tab_character || ' ';
    tab_string = str_repeat(tab_character, tab_size);

    input = js_source_text;
    input_length = input.length;

    last_word = '';            // last TK_WORD passed
    last_type = TK_START_EXPR; // last token type
    last_text = '';            // last token text
    output    = '';

    // words which should always start on new line.
    // simple hack for cases when lines aren't ending with semicolon.
    // feel free to tell me about the ones that need to be added.
    line_starters = 'continue,try,throw,return,var,if,switch,case,default,for,while,break,function'.split(',');

    // states showing if we are currently in expression (i.e. "if" case) - IN_EXPR, or in usual block (like, procedure), IN_BLOCK.
    // some formatting depends on that.
    _in       = IN_BLOCK;
    ins      = [_in];


    _indent   = 0;
    _pos      = 0; // parser position
    in_case  = false; // flag for parser that case/default has been processed, and next colon needs special attention

    while (true) {
        var t=get_next_token(_pos); token_text = t[0];  token_type = t[1];
        if (token_type == TK_EOF) {
            break;
        }

        // $output .= " [$token_type:$last_type]";

        switch(token_type) {

        case TK_START_EXPR:

            in_(IN_EXPR);
            if (last_type == TK_END_EXPR || last_type == TK_START_EXPR) {
                // do nothing on (( and )( and ][ and ]( ..
            } else if (last_type != TK_WORD && last_type != TK_OPERATOR) {
                space();
            } else if (in_array(last_word, line_starters) && last_word != 'function') {
                space();
            }
            token();
            break;

        case TK_END_EXPR:

            token();
            in_pop();
            break;

        case TK_START_BLOCK:

            in_(IN_BLOCK);
            if (last_type != TK_OPERATOR && last_type != TK_START_EXPR) {
                if (last_type == TK_START_BLOCK) {
                    nl();
                } else {
                    space();
                }
            }
            token();
            indent();
            break;

        case TK_END_BLOCK:

            if (last_type == TK_END_EXPR) {
                unindent();
                nl();
            } else if (last_type == TK_END_BLOCK) {
                unindent();
                nl();
            } else if (last_type == TK_START_BLOCK) {
                // nothing
                unindent();
            } else {
                unindent();
                nl();
            }
            token();
            in_pop();
            break;

        case TK_WORD:

            if (token_text == 'case' || token_text == 'default') {
                if (last_text == ':') {
                    // switch cases following one another
                    remove_indent();
                } else {
                    _indent--;
                    nl();
                    _indent++;
                }
                token();
                in_case = true;
                break;
            }

            prefix = PRINT_NONE;
            if (last_type == TK_END_BLOCK) {
                if (!in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
                    prefix = PRINT_NL;
                } else {
                    prefix = PRINT_SPACE;
                    space();
                }
            } else if (last_type == TK_END_COMMAND && _in == IN_BLOCK) {
                prefix = PRINT_NL;
            } else if (last_type == TK_END_COMMAND && _in == IN_EXPR) {
                prefix = PRINT_SPACE;
            } else if (last_type == TK_WORD) {
                if (last_word == 'else') { // else if
                    prefix = PRINT_SPACE;
                } else {
                    prefix = PRINT_SPACE;
                }
            } else if (last_type == TK_START_BLOCK) {
                prefix = PRINT_NL;
            } else if (last_type == TK_END_EXPR) {
                space();
            }

            if (in_array(token_text, line_starters) || prefix == PRINT_NL) {

                if (last_text == 'else') {
                    // no need to force newline on else break
                    // DONOTHING
                    space();
                } else if ((last_type == TK_START_EXPR || last_text == '=') && token_text == 'function') {
                    // no need to force newline on 'function': (function
                    // DONOTHING
                } else if (last_type == TK_WORD && (last_text == 'return' || last_text == 'throw')) {
                    // no newline between 'return nnn'
                    space();
                } else
                    if (last_type != TK_END_EXPR) {
                        if ((last_type != TK_START_EXPR || token_text != 'var') && last_text != ':') {
                            // no need to force newline on 'var': for (var x = 0...)
                            if (token_text == 'if' && last_type == TK_WORD && last_word == 'else') {
                                // no newline for } else if {
                                space();
                            } else {
                                nl();
                            }
                        }
                    }
            } else if (prefix == PRINT_SPACE) {
                space();
            }
            token();
            last_word = token_text.toLowerCase();
            break;

        case TK_END_COMMAND:

            token();
            break;

        case TK_STRING:

            if (last_type == TK_START_BLOCK || last_type == TK_END_BLOCK) {
                nl();
            } else if (last_type == TK_WORD) {
                space();
            }
            token();
            break;

        case TK_OPERATOR:
            start_delim = true;
            end_delim   = true;

            if (token_text == ':' && in_case) {
                token(); // colon really asks for separate treatment
                nl();
                expecting_case = false;
                break;
            }

            in_case = false;



            if (token_text == ',') {
                if (last_type == TK_END_BLOCK) {
                    token();
                    nl();
                } else {
                    if (_in == IN_BLOCK) {
                        token();
                        nl();
                    } else {
                        token();
                        space();
                    }
                }
                break;
            } else if (token_text == '--' || token_text == '++') { // unary operators special case
                if (last_text == ';') {
                    // space for (;; ++i)
                    start_delim = true;
                    end_delim = false;
                } else {
                    start_delim = false;
                    end_delim = false;
                }
            } else if (token_text == '!' && last_type == TK_START_EXPR) {
                // special case handling: if (!a)
                start_delim = false;
                end_delim = false;
            } else if (last_type == TK_OPERATOR) {
                start_delim = false;
                end_delim = false;
            } else if (last_type == TK_END_EXPR) {
                start_delim = true;
                end_delim = true;
            } else if (token_text == '.') {
                // decimal digits or object.property
                start_delim = false;
                end_delim   = false;

            } else if (token_text == ':') {
                // zz: xx
                // can't differentiate ternary op, so for now it's a ? b: c; without space before colon
                start_delim = false;
            }
            if (start_delim) {
                space();
            }

            token();

            if (end_delim) {
                space();
            }
            break;

        case TK_BLOCK_COMMENT:

            nl();
            token();
            nl();
            break;

        case TK_COMMENT:

            //if (last_type != TK_COMMENT) {
            nl();
            //}
            token();
            nl();
            break;

        case TK_UNKNOWN:
            token();
            break;
        }

        if (token_type != TK_COMMENT) {
            last_type = token_type;
            last_text = token_text;
        }
    }

    // clean empty lines from redundant spaces
    output = output.replace('/^ +$/m', '');

    return output;
}




function nl(ignore_repeated)
{
    //global $indent, $output, $tab_string;
    ignore_repeated = (typeof ignore_repeated=='undefined'?true:ignore_repeated);
    output = rtrim(output); // remove possible indent

    if (output == '') return; // no newline on start of file

    if (output.substr(output.length-1) != "\n" || !ignore_repeated) {
        output += "\n";
    }
    output += str_repeat(tab_string, _indent);
}



function space()
{
    //global $output;

    if (output && output.substr(output.length-1) != ' ')  { // prevent occassional duplicate space
        output += ' ';
    }
}


function token()
{
    //global $token_text, $output;
    output += token_text;
}

function indent()
{
    //global $indent;
    _indent++;
}


function unindent()
{
    //global $indent;
    if (_indent) {
        _indent --;
    }
}


function remove_indent()
{
    //global $tab_string, $output;
    var tab_string_len = tab_string.length-1;
    if (output.substr(output.length-tab_string_len) == tab_string) {
        output = output.substr(0, output.length-tab_string_len);
    }
}


function in_(_where)
{
    //global $ins, $in;
    ins.push(_in);
    _in = _where;
}


function in_pop()
{
    //global $ins, $in;
    _in = ins.pop();
}



function make_array(str)
{
    res = [];
    for (var i = 0; i < str.length; i++) {
        res.push(str.charAt(i));
    }
    return res;
}


var whitespace,wordchar,punct;
function get_next_token()
{
    //global $last_type;
    //global $whitespace, $wordchar, $punct;
    //global $input, $input_length;


    if (!whitespace) whitespace = make_array("\n\r\t ");
    if (!wordchar)   wordchar   = make_array('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$');
    if (!punct)      punct  = '+ - * / % & ++ -- = += -= *= /= %= == === != !== > < >= <= >> << >>> >>>= >>= <<= && &= | || ! !! , : ? ^ ^= |='.split(' ');

    n_newlines = 0;  var c = '';
    do {
        if (_pos >= input_length) {
            return ['', TK_EOF];
        }
        c = input.charAt(_pos);
        _pos += 1;
        if (c == "\n") {
            nl(n_newlines == 0);
            n_newlines += 1;
        }
    } while (in_array(c, whitespace));

    if (in_array(c, wordchar)) {
        if (_pos < input_length) {
            while (in_array(input.charAt(_pos), wordchar)) {
                c += input.charAt(_pos);
                _pos += 1;
                if (_pos == input_length) break;
            }
        }

        // small and surprisingly unugly hack for 1E-10 representation
        if (_pos != input_length && c.match(/^\d+[Ee]$/) && input.charAt(_pos) == '-') {
            _pos += 1;
            var t=get_next_token(_pos); next_word = t[0]; next_type = t[1];
            c += '-' + next_word;
            return [c, TK_WORD];
        }

        if (c == 'in') { // hack for 'in' operator
            return [c, TK_OPERATOR];
        }
        return [c, TK_WORD];
    }

    if (c == '(' || c == '[') {
        return [c, TK_START_EXPR];
    }

    if (c == ')' || c == ']') {
        return [c, TK_END_EXPR];
    }

    if (c == '{') {
        return [c, TK_START_BLOCK];
    }

    if (c == '}') {
        return [c, TK_END_BLOCK];
    }

    if (c == ';') {
        return [c, TK_END_COMMAND];
    }

    if (c == '/') {
        // peek for comment /* ... */
        if (input.charAt(_pos) == '*') {
            comment = '';
            _pos += 1;
            if (_pos < input_length) {
                while (!(input.charAt(_pos) == '*' && input.charAt(_pos + 1) && input.charAt(_pos + 1) == '/') && _pos < input_length) {
                    comment += input.charAt(_pos);
                    _pos += 1;
                    if (_pos >= input_length) break;
                }
            }
            _pos +=2;
            return ['/*'+comment+'*/', TK_BLOCK_COMMENT];
        }
        // peek for comment // ...
        if (input.charAt(_pos) == '/') {
            comment = c;
            while (input.charAt(_pos) != "\x0d" && input.charAt(_pos) != "\x0a") {
                comment += input.charAt(_pos);
                _pos += 1;
                if (_pos >= input_length) break;
            }
            _pos += 1;
            return [comment, TK_COMMENT];
        }

    }

    if (c == "'" || // string
        c == '"' || // string
        (c == '/' &&
            ((last_type == TK_WORD && last_text == 'return') || (last_type == TK_START_EXPR || last_type == TK_END_BLOCK || last_type == TK_OPERATOR || last_type == TK_EOF || last_type == TK_END_COMMAND)))) { // regexp
        sep = c;
        c   = '';
        esc = false;

        if (_pos < input_length) {

            while (esc || input.charAt(_pos) != sep) {
                c += input.charAt(_pos);
                if (!esc) {
                    esc = input.charAt(_pos) == '\\';
                } else {
                    esc = false;
                }
                _pos += 1;
                if (_pos >= input_length) break;
            }

        }

        _pos += 1;
        if (last_type == TK_END_COMMAND) {
            nl();
        }
        return [sep + c + sep, TK_STRING];
    }

    if (in_array(c, punct)) {
        while (_pos < input_length && in_array(c + input.charAt(_pos), punct)) {
            c += input.charAt(_pos);
            _pos += 1;
            if (_pos >= input_length) break;
        }
        return [c, TK_OPERATOR];
    }

    return [c, TK_UNKNOWN];
}

// javascript specific functions

function in_array(what, arr)
{
  for (var i=0;i<arr.length;i++)
  {
    if (arr[i]==what) return true;
  }
  return false;
}

function str_repeat(str, cnt)
{
   var ret=''
   for (var i=0;i<cnt;i++) ret+=str;
   return ret
}

function rtrim(str)
{
   return str.replace(/ +$/,"");
}
