$(document).ready(function()
{
    var cmGrammar = CodeMirror.fromTextArea(document.getElementById("taGrammar"), {lineNumbers: true});
    var cmParseMe = CodeMirror.fromTextArea(document.getElementById("taParseMe"), {lineNumbers: true});
    var cmOutput  = CodeMirror.fromTextArea(document.getElementById("taOutput"),  {readOnly: true});

    $.get("calculator.jison", function(data)
    {
        cmGrammar.setValue(data);
    });

    $.get("calculator.test", function(data)
    {
        cmParseMe.setValue(data);
    });

    $("#taGrammar").next().addClass("SourceEditor");
    $("#taParseMe").next().addClass("SourceEditor");
    $("#taOutput").next().addClass("OutputWindow");
    
    function hightlightSyntax(lexer, cm)
    {
        cm.setValue(cm.getValue()); // Clear away any previous syntax highlighting
        
        // Mark everything grey, since anything left untokenised doesn't do anything and thus is by definition a comment 
        cm.doc.markText({line: 0, ch: 0},
                        {line: cm.lastLine() + 1,  ch: 0},
                        {className: "Grey"});

        lexer.setInput(cm.getValue());

        while (!lexer.done)
        {
            var typeId = lexer.lex();

            var colorClass = "Black";

            if (typeof typeId == "string")
            {
                typeId = typeId.length;
            }

            switch(typeId % 6)
            {
            case 0:
                colorClass = "Red";
                break;
            case 1:
                colorClass = "Orange";
                break;
            // Yellow is too hard to see on a white background
            case 2:
                colorClass = "Green";
                break;
            case 3:
                colorClass = "Blue";
                break;
            case 4:
                colorClass = "Indigo";
                break;
            case 5:
                colorClass = "Violet";
                break;
            }

            cm.doc.markText({line: lexer.yylloc.first_line - 1, ch: lexer.yylloc.first_column},
                            {line: lexer.yylloc.last_line - 1,  ch: lexer.yylloc.last_column},
                            {className: colorClass});
        }
    };
    
    /* What follows is based on http://zaach.github.io/jison/try/ */

    $("#process_btn").click(processGrammar);

    function processGrammar()
    {
        var type = "lalr";

        var grammar = cmGrammar.getValue();

        var regxOpenBrace = new RegExp("^[ \t\r\n]*{");

        if (regxOpenBrace.test(grammar))
        {
            // The first non-whitespace character is an open-brace, assume this grammar is in JSON format

            try
            {
                hightlightSyntax(jsonLexer, cmGrammar);
                var cfg = JSON.parse(grammar);
            }
            catch(e)
            {
                cmOutput.setValue(e.toString());
                $("#taOutput").next().addClass('bad');
                return;
            }
        }
        else
        {
            // The first non-whitespace character is not an open-brace, assume this grammar is in EBNF format 

            try
            {
                hightlightSyntax(lex.lexer, cmGrammar);
                var cfg = bnf.parse(grammar);
            }
            catch (e)
            {
                cmOutput.setValue(e.toString());
                $("#taOutput").next().removeClass('good').addClass('bad');
                return;
            }
        }

        Jison.print = function () {};
        parser = Jison.Generator(cfg, {type: type});

        $("#out").removeClass("good").removeClass("bad").html('');
        $("#gen_out").removeClass("good").removeClass("bad");
        if (!parser.conflicts)
        {
            cmOutput.setValue('Generated successfully!');
            $("#taOutput").next().removeClass('bad').addClass('good');
        }
        else
        {
            cmOutput.setValue('Conflicts encountered:\n');
            $("#taOutput").next().removeClass('good').addClass('bad');
        }

        parser.resolutions.forEach(function (res)
        {
            var r = res[2];
            if (!r.bydefault) return;
            cmOutput.setValue(cmOutput.getValue() + r.msg+"\n"+"("+r.s+", "+r.r+") -> "+r.action);
        });

        parser2 = parser.createParser();

        try
        {
            hightlightSyntax(parser.lexer, cmParseMe);
            var output = parser2.parse(cmParseMe.getValue());
            cmOutput.setValue(cmOutput.getValue() + "\r\n\r\n" + JSON.stringify(output, undefined, 2));
        }
        catch (e)
        {
            cmOutput.setValue(cmOutput.getValue() + "\r\n\r\n" + e.toString());
            $("#taOutput").next().removeClass('good').addClass('bad');
            return;
        }

    }

});

