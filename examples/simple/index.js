var fs = require('fs');

async

function main() {
    var ok = (await fb.exists('index.js'));

    if (ok)
        console.log('index.js exists');
    else
        console.log('index.js not exists');
}

main(function () {
    console.log('finish');
});
