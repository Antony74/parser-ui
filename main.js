$(document).ready(function()
{
    var editor1 = CodeMirror.fromTextArea(document.getElementById("taGrammar"), {lineNumbers: true});
    var editor2 = CodeMirror.fromTextArea(document.getElementById("taParseMe"), {lineNumbers: true});

    $.get("calculator.jison", function(data)
    {
        editor1.setValue(data);
    });

    $.get("calculator.test", function(data)
    {
        editor2.setValue(data);
    });

});

