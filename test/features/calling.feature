Feature: call async functions using await

Scenario: Declaring [case]

   Given I need to transpile [case]
    When EcmaScript6=[EcmaScript6]
    Then EcmaScript5=[EcmaScript5]
#     And eval fn equals to [result]

Examples:
  case             ┆ result ┆ EcmaScript6                             ┆ EcmaScript5


  just call        ┆ -      ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆        ┆    await divide(2,2);                   ┆   return divide(2, 2, function(err, $res1) {
                   ┆        ┆ }                                       ┆     callback();
                   ┆        ┆                                         ┆   }
                   ┆        ┆                                         ┆ }

###

  call 2 times     ┆undefined┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆    await divide(2,2);                   ┆   return divide(2, 2, function(err, $res1) {
                   ┆         ┆    await divide(2,2);                   ┆     return divide(2, 2, function(err, $res1) {
                   ┆         ┆ }                                       ┆       callback();
                   ┆         ┆                                         ┆     }
                   ┆         ┆                                         ┆   }
                   ┆         ┆                                         ┆ }



  just a return    ┆    1    ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆   return await divide(2,2);             ┆   return divide(2, 2, callback);
                   ┆         ┆ }                                       ┆ }



  return expression┆   11    ┆ async function fn() {                   ┆ function fn(callback) {
    with await     ┆         ┆   return await divide(2,2) + 10;        ┆   return divide(2, 2, function(err, $res1) {
                   ┆         ┆ }                                       ┆     if(err)
                   ┆         ┆                                         ┆       return callback(err);
                   ┆         ┆                                         ┆     return callback(null, $res1 + 10);
                   ┆         ┆                                         ┆   }
                   ┆         ┆                                         ┆ }

  var + return     ┆    2    ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆   var res = await divide(4,2);          ┆   return divide(4, 2, function(err, res) {
                   ┆         ┆   return res;                           ┆     return callback(err, res);
                   ┆         ┆ }                                       ┆ }

  var without      ┆undefined┆ async function fn() {                   ┆ function fn(callback) {
    return         ┆         ┆   var res = await divide(4,2);          ┆   return divide(4, 2, function(err, res) {
                   ┆         ┆ }                                       ┆     return callback(err);
                   ┆         ┆                                         ┆   }
                   ┆         ┆                                         ┆ }

###
