var double = require('./sample').double;

async function sample003(){
  return ((await double(5))+(await double(2)));
}
