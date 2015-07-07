var double = require('./sample').double;

async function sample004(){
  var x,y;
  x=await double(5);
  y=await double(2);
  return x + y;
}


function sample004(callback){
  var x,y;

  double(5,function (err, x){
    y=await double(2);
    return x + y;
  }
}


1. saber se é função async -> fn
2. subir até achar o statement -> pos
   fn.body.splice
