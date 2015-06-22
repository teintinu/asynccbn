var double = require('./sample').double;

async function sample003(){
  console.log(await double(5)+await double(2));
}
