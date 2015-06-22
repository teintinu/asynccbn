var double = require('./sample').double;

async function sample002(){
  var x=await double(5);
  return x;
}
