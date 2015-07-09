Feature: call async functions using await

Scenario: Calling [case]

   Given I need to transpile [case]
    When EcmaScript6 at [EcmaScript6.start.line]:[EcmaScript6.start.column] = [EcmaScript6] 
    Then EcmaScript5 at [EcmaScript5.start.line]:[EcmaScript5.start.column] = [EcmaScript5] 
     And eval fn equals to [result]

Examples:
  case:ID          ┆ result  ┆ EcmaScript6:LOC                         ┆ EcmaScript5:LOC
----------------------------------------------------------------------------------------------------------------------

  just call        ┆ -       ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆    await divide(2,2);                   ┆   divide(2, 2, function(err$, res$1) {
                   ┆         ┆ }                                       ┆     callback(err$);
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

----------------------------------------------------------------------------------------------------------------------
  call 2 times     ┆ -       ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆    await divide(2,2);                   ┆   divide(2, 2, function(err$, res$1) {
                   ┆         ┆    await divide(2,2);                   ┆     if (err$) return callback(err$);
                   ┆         ┆ }                                       ┆     divide(2, 2, function(err$, res$2) {
                   ┆         ┆                                         ┆       callback(err$);
                   ┆         ┆                                         ┆     });
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

----------------------------------------------------------------------------------------------------------------------
  just a return    ┆    1    ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆   return await divide(2,2);             ┆   divide(2, 2, callback);
                   ┆         ┆ }                                       ┆ }

----------------------------------------------------------------------------------------------------------------------
  return binary    ┆   11    ┆ async function fn() {                   ┆ function fn(callback) {
    expression     ┆         ┆   return await divide(2,2) + 10;        ┆   divide(2, 2, function(err$, res$1) {
    with await     ┆         ┆ }                                       ┆     if(err$)
                   ┆         ┆                                         ┆       return callback(err$);
                   ┆         ┆                                         ┆     callback(null, res$1 + 10);
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

----------------------------------------------------------------------------------------------------------------------
  call 2 times     ┆ 9       ┆ async function fn() {                   ┆ function fn(callback) {
     expression    ┆         ┆   return await divide(8,2) +            ┆   divide(8, 2, function(err$, res$1) {
                   ┆         ┆     await divide(10,2);                 ┆     if (err$) return callback(err$);
                   ┆         ┆ }                                       ┆     divide(10, 2, function(err$, res$2) {
                   ┆         ┆                                         ┆       if (err$) return callback(err$);
                   ┆         ┆                                         ┆       callback(null, res$1+res$2);
                   ┆         ┆                                         ┆     });
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

----------------------------------------------------------------------------------------------------------------------
  return unary     ┆  false  ┆ async function fn() {                   ┆ function fn(callback) {
    expression     ┆         ┆   return !await divide(2,2);            ┆   divide(2, 2, function(err$, res$1) {
    with await     ┆         ┆ }                                       ┆     if(err$)
                   ┆         ┆                                         ┆       return callback(err$);
                   ┆         ┆                                         ┆     callback(null, !res$1);
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

----------------------------------------------------------------------------------------------------------------------
  return call      ┆    1    ┆ async function fn() {                   ┆ function fn(callback) {
    expression     ┆         ┆   return Math.round(await divide(2,2)); ┆   divide(2, 2, function(err$, res$1) {
    with await     ┆         ┆ }                                       ┆     if(err$)
                   ┆         ┆                                         ┆       return callback(err$);
                   ┆         ┆                                         ┆     callback(null, Math.round(res$1));
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

----------------------------------------------------------------------------------------------------------------------
  var + return     ┆    2    ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆   var res = await divide(4,2);          ┆   divide(4, 2, function(err$, res) {
                   ┆         ┆   return res;                           ┆     callback(err$, res);
                   ┆         ┆ }                                       ┆   });
                   ┆         ┆                                         ┆ }


----------------------------------------------------------------------------------------------------------------------
  var + return     ┆    5    ┆ async function fn() {                   ┆ function fn(callback) {
    await twice    ┆         ┆   var res = await divide(4,2)+          ┆   divide(4, 2, function(err$, res$1) {
                   ┆         ┆             await divide(6,2);          ┆     if (err$) return callback(err$);
                   ┆         ┆   return res;                           ┆     divide(6, 2, function(err$, res$2) {
                   ┆         ┆ }                                       ┆       if (err$) return callback(err$);
                   ┆         ┆                                         ┆       var res=res$1+res$2;
                   ┆         ┆                                         ┆       callback(null, res);
                   ┆         ┆                                         ┆     });
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

----------------------------------------------------------------------------------------------------------------------
  var without      ┆ -       ┆ async function fn() {                   ┆ function fn(callback) {
    return         ┆         ┆   var res = await divide(6,2);          ┆   divide(6, 2, function(err$, res) {
                   ┆         ┆ }                                       ┆     callback(err$);
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

----------------------------------------------------------------------------------------------------------------------
  vars + return    ┆    5    ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆   var x=1,res = await divide(8,2);      ┆   divide(8, 2, function(err$, res) {
   x is no away    ┆         ┆   return res+x;                         ┆     if (err$) return callback(err$);
                   ┆         ┆ }                                       ┆     var x=1;
                   ┆         ┆                                         ┆     callback(null, res+x);
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

----------------------------------------------------------------------------------------------------------------------
  vars + return    ┆    7    ┆ async function fn() {                   ┆ function fn(callback) {
    await twice    ┆         ┆   var a = await divide(12,3),           ┆   divide(12, 3, function(err$, a) {
                   ┆         ┆       b = await divide(12,4);           ┆     if (err$) return callback(err$);
                   ┆         ┆   return a + b;                         ┆     divide(12, 4, function(err$, b) {
                   ┆         ┆ }                                       ┆       if (err$) return callback(err$);
                   ┆         ┆                                         ┆       callback(null, a + b);
                   ┆         ┆                                         ┆     });
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

----------------------------------------------------------------------------------------------------------------------
  assign+return    ┆   10    ┆ async function fn() {                   ┆ function fn(callback) {
    await twice    ┆         ┆   var a,b;                              ┆   var a,b;
                   ┆         ┆   a = await divide(18,3);               ┆   divide(18, 3, function(err$, res$1) {
                   ┆         ┆   b = await divide(16,4);               ┆     if (err$) return callback(err$);
                   ┆         ┆   return a + b;                         ┆     a = res$1;
                   ┆         ┆ }                                       ┆     divide(16, 4, function(err$, res$2) {
                   ┆         ┆                                         ┆       if (err$) return callback(err$);
                   ┆         ┆                                         ┆       b = res$2;
                   ┆         ┆                                         ┆       callback(null, a + b);
                   ┆         ┆                                         ┆     });
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }                   

----------------------------------------------------------------------------------------------------------------------
  vars without     ┆ -       ┆ async function fn() {                   ┆ function fn(callback) {
    return         ┆         ┆   var x=2,res = await divide(10,2);     ┆   divide(10, 2, function(err$, res) {
                   ┆         ┆ }                                       ┆     if(err$) return callback(err$);
                   ┆         ┆                                         ┆     var x=2;
                   ┆         ┆                                         ┆     callback();
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

----------------------------------------------------------------------------------------------------------------------
  var + return     ┆    7    ┆ async function fn() {                   ┆ function fn(callback) {
     expr          ┆         ┆   var res = await divide(12,2)+1;       ┆   divide(12, 2, function(err$, res$1) {
                   ┆         ┆   return res;                           ┆     if(err$) return callback(err$);
                   ┆         ┆ }                                       ┆     var res= res$1+1;
                   ┆         ┆                                         ┆     callback(null, res);
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

----------------------------------------------------------------------------------------------------------------------
  var without      ┆    -    ┆ async function fn() {                   ┆ function fn(callback) {
     return expr   ┆         ┆   var res = await divide(14,2)+1;       ┆   divide(14, 2, function(err$, res$1) {
                   ┆         ┆ }                                       ┆     if(err$) return callback(err$);
                   ┆         ┆                                         ┆     var res= res$1+1;
                   ┆         ┆                                         ┆     callback();
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }

