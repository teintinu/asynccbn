var nops = 0 ;
async function nop() {
	nops++ ;
    return;
}

async function limit() {
	return 10 ;
}

async function test() {
  var s = "" ;
  nops = 0 ;
  for (var n=0;n<await limit();n++) {
    if (n>5) {
        await nop() ;
    }
    s += "." ;
  }
  return s.length==10 && nops==4;
}

module.exports = test ;
