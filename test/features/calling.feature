Feature: call async functions using await

Scenario: Calling [case]

   Given I need to transpile [case]
    When EcmaScript6=[EcmaScript6]
    Then EcmaScript5=[EcmaScript5]
#     And eval fn equals to [result]

Examples:
  case             ┆ result ┆ EcmaScript6                              ┆ EcmaScript5


  just call        ┆ -       ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆    await divide(2,2);                   ┆   divide(2, 2, function(err$, res$1) {
                   ┆         ┆ }                                       ┆     callback(err$);
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

  call 2 times     ┆ -       ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆    await divide(2,2);                   ┆   divide(2, 2, function(err$, res$1) {
                   ┆         ┆    await divide(2,2);                   ┆     if (err$) return callback(err$);
                   ┆         ┆ }                                       ┆     divide(2, 2, function(err$, res$2) {
                   ┆         ┆                                         ┆       callback(err$);
                   ┆         ┆                                         ┆     });
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

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
    return         ┆         ┆   var res = await divide(6,2);          ┆   divide(6, 2, function(err$, res) {
                   ┆         ┆ }                                       ┆     callback(err$);
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

  vars + return    ┆    2    ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆   var x=1,res = await divide(8,2);      ┆   divide(8, 2, function(err$, res) {
                   ┆         ┆   return res+x;                         ┆     if (err$) return callback(err$);
                   ┆         ┆ }                                       ┆     var x=1;
                   ┆         ┆                                         ┆     callback(null, res+x);
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

  vars without     ┆ -       ┆ async function fn() {                   ┆ function fn(callback) {
    return         ┆         ┆   var x=2,res = await divide(10,2);     ┆   divide(10, 2, function(err$, res) {
                   ┆         ┆ }                                       ┆     if(err$) return callback(err$);
                   ┆         ┆                                         ┆     var x=2;
                   ┆         ┆                                         ┆     callback();
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

  var + return     ┆    2    ┆ async function fn() {                   ┆ function fn(callback) {
     expr          ┆         ┆   var res = await divide(12,2)+1;       ┆   divide(12, 2, function(err$, res$1) {
                   ┆         ┆   return res;                           ┆     if(err$) return callback(err$);
                   ┆         ┆ }                                       ┆     var res= res$1+1;
                   ┆         ┆                                         ┆     callback(null, res);
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

  var without      ┆    2    ┆ async function fn() {                   ┆ function fn(callback) {
     return expr   ┆         ┆   var res = await divide(14,2)+1;       ┆   divide(14, 2, function(err$, res$1) {
                   ┆         ┆ }                                       ┆     if(err$) return callback(err$);
                   ┆         ┆                                         ┆     var res= res$1+1;
                   ┆         ┆                                         ┆     callback();
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

  if after         ┆ -       ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆    var r=await divide(16,2);            ┆   divide(16, 2, function(err$, r) {
                   ┆         ┆    if (r==8)                            ┆     if(err$) return callback(err$);
                   ┆         ┆      return r;                          ┆     if (r==8)
                   ┆         ┆    else                                 ┆       callback(null, r)
                   ┆         ┆      return 0;                          ┆     else
                   ┆         ┆ }                                       ┆       callback(null, 0);                   
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }                   