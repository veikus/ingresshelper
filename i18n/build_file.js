/**
 * @file Internationalization file builder
 * @author Artem Veikus artem@veikus.com
 * @version 2.2
 */

var parser,
    fs = require('fs'),
    parse = require('csv-parse');

parser = parse({ delimiter: ',' }, function(err, data) {
    var result;

    if (err) {
        throw err;
    }

    result = buildResult(data);
    saveFile(result);
});

fs.createReadStream(__dirname + '/i18n.csv').pipe(parser);


function buildResult(data) {
    var i, j, langCode, key, line, currentModule,
        languageCodes = data[1],
        result = {};

    for (i = 2; i < data.length; ++i) {
        line = data[i];

        if (line[0] === '') {
            continue;
        }

        if (line[0].indexOf('module') === 0) {
            currentModule = line[0].substring(line[0].indexOf(' ') + 1);
            result[currentModule] = {};
            continue;
        }

        if (currentModule) {
            key = line[0];
            result[currentModule][key] = {};

            for (j = 1; j < line.length; ++j) {
                langCode = languageCodes[j];

                if (langCode && line[j]) {
                    result[currentModule][key][langCode] = line[j];
                }
            }
        }
    }

    return result;
}

function saveFile(data) {
    var result = '';

    result += '// THIS FILE IS BUILD AUTOMATICALLY. PLEASE DO NOT MODIFY IT\n';
    result += 'app.i18nTexts = ' + JSON.stringify(data, null, '\t');
    result += ';';

    fs.open(__dirname + '/i18n.js', 'w', function(err, fd) {
        if (err) {
            throw 'Error opening file: ' + err;
        }

        fs.write(fd, result, function(err) {
            if (err) {
                throw 'error writing file: ' + err;
            }

            fs.close(fd, function() {
                console.log('File written');
            })
        });
    });
}