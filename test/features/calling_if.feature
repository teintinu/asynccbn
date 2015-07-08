Feature: call async functions using await

Scenario: Calling with if and await [case]

   Given I need to transpile [case]
    When EcmaScript6 at [EcmaScript6.start.line]:[EcmaScript6.start.column] = [EcmaScript6] 
    Then EcmaScript5 at [EcmaScript5.start.line]:[EcmaScript5.start.column] = [EcmaScript5] 
#     And eval fn equals to [result]

Examples:
  case:ID          ┆ result  ┆ EcmaScript6:LOC                         ┆ EcmaScript5:LOC

  after            ┆ 8       ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆    var r=await divide(16,2);            ┆   divide(16, 2, function(err$, r) {
                   ┆         ┆    if (r==8)                            ┆     if(err$) return callback(err$);
                   ┆         ┆      return r;                          ┆     if (r==8)
                   ┆         ┆    else                                 ┆       callback(null, r)
                   ┆         ┆      throw "error";                     ┆     else
                   ┆         ┆ }                                       ┆       callback("error");                   
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }                   
                   
  in test          ┆ 9       ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆    if (await divide(18,2)==9)           ┆   divide(18, 2, function(err$, res$1) {
                   ┆         ┆      return 9;                          ┆     if(err$) return callback(err$);
                   ┆         ┆    else                                 ┆     if (res$1==8)
                   ┆         ┆      throw "error";                     ┆       callback(null, 9)
                   ┆         ┆ }                                       ┆     else
                   ┆         ┆                                         ┆       callback("error");
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }                                      
                   
  in consequent    ┆ -       ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆    var r=await divide(16,2);            ┆   divide(16, 2, function(err$, r) {
                   ┆         ┆    if (r==8)                            ┆     if(err$) return callback(err$);
                   ┆         ┆      return r;                          ┆     if (r==8)
                   ┆         ┆    else                                 ┆       callback(null, r)
                   ┆         ┆      throw "error";                     ┆     else
                   ┆         ┆ }                                       ┆       callback("error");
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }                                                         