var fs = require('fs');

var n = fs.readdirSync('.').length ;

async function test(dir) {
	var files ;
	for (var i=0; i<100; i++) {
		files = await fs.readdir(dir) ;
		for (var j=0; j<files.length; j++) {
			var stat = await fs.stat(dir+"/"+files[j]) ;
		}
	}
	return files.length ;
}

module.exports = async function() {
	return await test('.')==n ;
}

