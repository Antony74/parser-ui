// Script for converting non-ascii to ascii-escape-sequences.  I used this to fix the
// problem I was having uploading jison.js to a remote server.  It doesn't really
// belong here, but I don't want to mis-place it either.

var fs = require("fs");
var strIn = fs.readFileSync("jison-min.js", {encoding: "utf8"});

var strOut = to_ascii(strIn);

fs.writeFileSync("jison.js", strOut, {encoding: "utf8"});

function to_ascii(str) {
    return str.replace(/[\u0080-\uffff]/g, function(ch) {
        var code = ch.charCodeAt(0).toString(16);
        while (code.length < 4) code = "0" + code;
        if (code.substring(0,2) == "00")
        {
            return "\\x" + code.substring(2);
        }
        else
        {
            return "\\u" + code;
        }
    });
};
