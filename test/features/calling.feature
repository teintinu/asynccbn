Feature: call async functions using await

Scenario: Calling [case]

   Given I need to transpile [case]
    When EcmaScript6=[EcmaScript6]
    Then EcmaScript5=[EcmaScript5]
#     And eval fn equals to [result]

Examples:
  case             ┆ result ┆ EcmaScript6                             ┆ EcmaScript5


  just call        ┆ -      ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆        ┆    await divide(2,2);                   ┆   divide(2, 2, function(err$1, res$1) {
                   ┆        ┆ }                                       ┆     callback(err$1);
                   ┆        ┆                                         ┆   });
                   ┆        ┆                                         ┆ }

  call 2 times     ┆ -      ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆        ┆    await divide(2,2);                   ┆   divide(2, 2, function(err$1, res$1) {
                   ┆        ┆    await divide(2,2);                   ┆     if (err$1) return callback(err$1);
                   ┆        ┆ }                                       ┆     divide(2, 2, function(err$2, res$2) {
                   ┆        ┆                                         ┆       callback(err$2);
                   ┆        ┆                                         ┆     });
                   ┆        ┆                                         ┆   });
                   ┆        ┆                                         ┆ }

  just a return    ┆    1    ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆   return await divide(2,2);             ┆   divide(2, 2, callback);
                   ┆         ┆ }                                       ┆ }

  return binary    ┆   11    ┆ async function fn() {                   ┆ function fn(callback) {
    expression     ┆         ┆   return await divide(2,2) + 10;        ┆   divide(2, 2, function(err$1, res$1) {
    with await     ┆         ┆ }                                       ┆     if(err$1)
                   ┆         ┆                                         ┆       return callback(err$1);
                   ┆         ┆                                         ┆     callback(null, res$1 + 10);
                   ┆         ┆                                         ┆   })
                   ┆         ┆                                         ┆ }

  return unary     ┆   11    ┆ async function fn() {                    ┆ function fn(callback) {
    expression     ┆         ┆   return !await divide(2,2);            ┆   divide(2, 2, function(err$1, res$1) {
    with await     ┆         ┆ }                                       ┆     if(err$1)
                   ┆         ┆                                         ┆       return callback(err$1);
                   ┆         ┆                                         ┆     callback(null, !res$1);
                   ┆         ┆                                         ┆   })
                   ┆         ┆                                         ┆ }

###


  var + return     ┆    2    ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆   var res = await divide(4,2);          ┆   return divide(4, 2, function(err, res) {
                   ┆         ┆   return res;                           ┆     return callback(err, res);
                   ┆         ┆ }                                       ┆ }

  var without      ┆undefined┆ async function fn() {                   ┆ function fn(callback) {
    return         ┆         ┆   var res = await divide(4,2);          ┆   divide(4, 2, function(err, res) {
                   ┆         ┆ }                                       ┆     callback(err);
                   ┆         ┆                                         ┆   }
                   ┆         ┆                                         ┆ }

###
