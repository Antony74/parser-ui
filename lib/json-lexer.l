/*
usage:	npm install -g jison-lex
		jison-lex json-lexer.l
*/

HEX_D			[a-fA-F0-9]
INT				[-]?[0-9]+
DOUBLE			{INT}((\.[0-9]+)?([eE][-+]?[0-9]+)?)
WS				[ \t\r\n]
UNESCAPED_CH	[^\"\\]
FALLBACK_CH		.

%s STRING_BEGIN

%%

<STRING_BEGIN>"\""					this.popState(); return 'QUOTE';
<STRING_BEGIN>[^\"\\]+				return 'CHAR';
<STRING_BEGIN>"\\\"" 				return 'ESCAPEDQUOTE';
<STRING_BEGIN>"\\\\"				return 'DOUBLEBACKSLASH';
<STRING_BEGIN>"\\\/"				return 'FORWARDSLASH';
<STRING_BEGIN>"\\b"					return 'BACKSPACE';
<STRING_BEGIN>"\\f"					return 'FORMFEED';
<STRING_BEGIN>"\\n"					return 'LF';
<STRING_BEGIN>"\\r"					return 'CR';
<STRING_BEGIN>"\\t"					return 'TAB';
<STRING_BEGIN>"\\u{HEX_D}{HEX_D}{HEX_D}{HEX_D}"	return 'ESCAPEDCHAR';
<STRING_BEGIN>"\\"					return 'BACKSLASH';

"\"" 										this.pushState('STRING_BEGIN'); return 'QUOTE';
[-]?[0-9]+									return 'INT';
[-]?[0-9]+((\.[0-9]+)?([eE][-+]?[0-9]+)?)	return 'DOUBLE';
"true"|"false"								return 'BOOL';
"null"										return 'NULL';
"{"						return 'PAREN';
"}"						return 'PAREN';
"["						return 'BOX';
"]"						return 'BOX';
","						return ',';
":"						return ':';
[ \t\r\n]+			    /* skip whitespace */
"."						return 'INVALID';

%%

