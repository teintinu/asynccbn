Feature: call async functions using await

Scenario: Calling [case]

   Given I need to transpile [case]
    When EcmaScript6=[EcmaScript6]
    Then EcmaScript5=[EcmaScript5]
#     And eval fn equals to [result]

Examples:
  case             ┆ result ┆ EcmaScript6                             ┆ EcmaScript5


  just call        ┆ -      ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆        ┆    await divide(2,2);                   ┆   divide(2, 2, function(err$, res$1) {
                   ┆        ┆ }                                       ┆     callback(err$);
                   ┆        ┆                                         ┆   });
                   ┆        ┆                                         ┆ }

  call 2 times     ┆ -      ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆        ┆    await divide(2,2);                   ┆   divide(2, 2, function(err$, res$1) {
                   ┆        ┆    await divide(2,2);                   ┆     if (err$) return callback(err$);
                   ┆        ┆ }                                       ┆     divide(2, 2, function(err$, res$2) {
                   ┆        ┆                                         ┆       callback(err$);
                   ┆        ┆                                         ┆     });
                   ┆        ┆                                         ┆   });
                   ┆        ┆                                         ┆ }

  just a return    ┆    1    ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆   return await divide(2,2);             ┆   divide(2, 2, callback);
                   ┆         ┆ }                                       ┆ }

  return binary    ┆   11    ┆ async function fn() {                   ┆ function fn(callback) {
    expression     ┆         ┆   return await divide(2,2) + 10;        ┆   divide(2, 2, function(err$, res$1) {
    with await     ┆         ┆ }                                       ┆     if(err$)
                   ┆         ┆                                         ┆       return callback(err$);
                   ┆         ┆                                         ┆     callback(null, res$1 + 10);
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

  return unary     ┆  false  ┆ async function fn() {                   ┆ function fn(callback) {
    expression     ┆         ┆   return !await divide(2,2);            ┆   divide(2, 2, function(err$, res$1) {
    with await     ┆         ┆ }                                       ┆     if(err$)
                   ┆         ┆                                         ┆       return callback(err$);
                   ┆         ┆                                         ┆     callback(null, !res$1);
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

  return unary     ┆    1    ┆ async function fn() {                   ┆ function fn(callback) {
    expression     ┆         ┆   return Math.round(await divide(2,2)); ┆   divide(2, 2, function(err$, res$1) {
    with await     ┆         ┆ }                                       ┆     if(err$)
                   ┆         ┆                                         ┆       return callback(err$);
                   ┆         ┆                                         ┆     callback(null, Math.round(res$1));
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

  var + return     ┆    2    ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆   var res = await divide(4,2);          ┆   divide(4, 2, function(err$, res) {
                   ┆         ┆   return res;                           ┆     callback(err$, res);
                   ┆         ┆ }                                       ┆   });
                   ┆         ┆                                         ┆ }

  var without      ┆ -       ┆ async function fn() {                   ┆ function fn(callback) {
    return         ┆         ┆   var res = await divide(4,2);          ┆   divide(4, 2, function(err$, res) {
                   ┆         ┆ }                                       ┆     callback(err$);
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

