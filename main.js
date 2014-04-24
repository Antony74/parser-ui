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
    
    function hightlightSyntax(lexer, types, cm)
    {
        cm.setValue(cm.getValue()); // Clear away any previous syntax highlighting

        lexer.setInput(cm.getValue());

        while (!lexer.done)
        {
            var typeId = lexer.lex();

            var colorClass = "Black";

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

        try
        {
            var cfg = JSON.parse(grammar);
        }
        catch(e)
        {
            try
            {
                var cfg = bnf.parse(grammar);
            }
            catch (e)
            {
                cmOutput.setValue("Oops. Make sure your grammar is in the correct format.");
                $("#taOutput").next().addClass('bad');
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
            $("#taOutput").next().addClass('good');
        }
        else
        {
            cmOutput.setValue('Conflicts encountered:\n');
            $("#taOutput").next().addClass('bad');
        }

        parser.resolutions.forEach(function (res)
        {
            var r = res[2];
            if (!r.bydefault) return;
            cmOutput.setValue(cmOutput.getValue() + r.msg+"\n"+"("+r.s+", "+r.r+") -> "+r.action);
        });

        parser2 = parser.createParser();

        hightlightSyntax(parser.lexer, parser.terminals_, cmParseMe);
    }

});

