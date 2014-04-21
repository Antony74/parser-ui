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

});

