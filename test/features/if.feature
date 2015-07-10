Feature: if and await
Scenario: [case]

   Given I need to transpile [case]
    When EcmaScript6 at [EcmaScript6.start.line]:[EcmaScript6.start.column] = [EcmaScript6] 
    Then EcmaScript5 at [EcmaScript5.start.line]:[EcmaScript5.start.column] = [EcmaScript5] 
     And eval fn equals to [result]

Examples:
  case:ID          ┆ result  ┆ EcmaScript6:LOC                         ┆ EcmaScript5:LOC

----------------------------------------------------------------------------------------------------------------------
  await after if   ┆ 8       ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆    var r=await divide(16,2);            ┆   divide(16, 2, function(err$, r) {
                   ┆         ┆    if (r==8)                            ┆     if(err$) return callback(err$);
                   ┆         ┆      return r;                          ┆     if (r==8)
                   ┆         ┆    else                                 ┆       callback(null, r)
                   ┆         ┆      throw "error";                     ┆     else
                   ┆         ┆ }                                       ┆       return callback("error");                   
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }                   

@Pending
----------------------------------------------------------------------------------------------------------------------
  await after if   ┆ 8       ┆ async function fn() {                   ┆ function fn(callback) {
    with block     ┆         ┆    var r=await divide(16,2);            ┆   divide(16, 2, function(err$, r) {
                   ┆         ┆    if (r==8)                            ┆     if(err$) return callback(err$);
                   ┆         ┆      { return r; }                      ┆     if (r==8)
                   ┆         ┆    else                                 ┆       { callback(null, r) }
                   ┆         ┆      { throw "error"; }                 ┆     else
                   ┆         ┆ }                                       ┆       { return callback("error"); }
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }                   

----------------------------------------------------------------------------------------------------------------------
  await in test    ┆ 9       ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆    if (await divide(18,2)==9)           ┆   divide(18, 2, function(err$, res$1) {
                   ┆         ┆      return 9;                          ┆     if(err$) return callback(err$);
                   ┆         ┆    else                                 ┆     if (res$1==9)
                   ┆         ┆      throw "error";                     ┆       callback(null, 9)
                   ┆         ┆ }                                       ┆     else
                   ┆         ┆                                         ┆       return callback("error");
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }                                      

----------------------------------------------------------------------------------------------------------------------
  await in         ┆ 3       ┆ async function fn() {                   ┆ function fn(callback) {
    consequent     ┆         ┆   if (divide)                           ┆   if (divide)
    with else      ┆         ┆     return await divide(9,3);           ┆      divide(9, 3, callback);
                   ┆         ┆   else                                  ┆   else    
                   ┆         ┆     throw "error";                      ┆     return callback("error"); 
                   ┆         ┆ }                                       ┆ }

----------------------------------------------------------------------------------------------------------------------
  await in         ┆ 42      ┆ async function fn() {                   ┆ function fn(callback) {
    consequent     ┆         ┆   if (divide)                           ┆   if (divide)
    twice          ┆         ┆     return await divide(27,3)+          ┆      divide(27, 3, function(err$, res$1) {
                   ┆         ┆            await divide(66,2);          ┆        if (err$) return callback(err$);
                   ┆         ┆   else                                  ┆        divide(66, 2, function(err$, res$2) {                     
                   ┆         ┆     throw "error";                      ┆          if (err$) return callback(err$);
                   ┆         ┆ }                                       ┆          callback(null, res$1+res$2);
                   ┆         ┆                                         ┆        });
                   ┆         ┆                                         ┆      });
                   ┆         ┆                                         ┆   else 
                   ┆         ┆                                         ┆     return callback("error");
                   ┆         ┆                                         ┆ }

@Pending
----------------------------------------------------------------------------------------------------------------------
  in consequent    ┆ -       ┆ async function fn() {                   ┆ function fn(callback) {
    block          ┆         ┆    var r=await divide(16,2);            ┆   divide(16, 2, function(err$, r) {
   2 await         ┆         ┆    if (r==8)                            ┆     if(err$) return callback(err$);
   alternate       ┆         ┆      return r;                          ┆     if (r==8)
                   ┆         ┆    else                                 ┆       callback(null, r)
                   ┆         ┆      throw "error";                     ┆     else
                   ┆         ┆ }                                       ┆       return callback("error");
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }                                                                            
                