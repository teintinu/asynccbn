Feature: Callback hell

Scenario: [case]

   Given I need to transpile [case]
    When EcmaScript7 at [EcmaScript7.start.line]:[EcmaScript7.start.column] = [EcmaScript7] 
    Then EcmaScript5 at [EcmaScript5.start.line]:[EcmaScript5.start.column] = [EcmaScript5] 
     And eval fn equals to [result]

Examples:
  case:ID          ┆ result  ┆ EcmaScript7:LOC                         ┆ EcmaScript5:LOC
----------------------------------------------------------------------------------------------------------------------

  just call        ┆ -       ┆ async function fn() {                   ┆ function fn(callback) {
                   ┆         ┆    await divide(2,2);                   ┆   divide(2, 2, function(err$, res$1) {
                   ┆         ┆    await divide(4,2);                   ┆     if (err$) return callback(err$);
                   ┆         ┆    await divide(6,2);                   ┆     divide(4, 2, function(err$, res$2) {
                   ┆         ┆    await divide(8,2);                   ┆       if (err$) return callback(err$);
                   ┆         ┆    await divide(10,2);                  ┆       divide(6, 2, function(err$, res$3) {
                   ┆         ┆ }                                       ┆         if (err$) return callback(err$);
                   ┆         ┆                                         ┆         divide(8, 2, function(err$, res$4) {
                   ┆         ┆                                         ┆           if (err$) return callback(err$);
                   ┆         ┆                                         ┆           divide(10, 2, function(err$, res$5) {
                   ┆         ┆                                         ┆              callback(err$);
                   ┆         ┆                                         ┆           });
                   ┆         ┆                                         ┆         });
                   ┆         ┆                                         ┆       });
                   ┆         ┆                                         ┆     });
                   ┆         ┆                                         ┆   });
                   ┆         ┆                                         ┆ }


  return           ┆ 15      ┆ async function fn() {                   ┆ function fn(callback) {
    expression     ┆         ┆    return await divide(2,2)+            ┆   divide(2, 2, function(err$, res$1) {
                   ┆         ┆                                         ┆     if (err$) return callback(err$);
                   ┆         ┆           await divide(4,2)+            ┆     divide(4, 2, function(err$, res$2) {
                   ┆         ┆                                         ┆       if (err$) return callback(err$);
                   ┆         ┆           await divide(6,2)+            ┆       divide(6, 2, function(err$, res$3) {
                   ┆         ┆                                         ┆         if (err$) return callback(err$);
                   ┆         ┆           await divide(8,2)+            ┆         divide(8, 2, function(err$, res$4) {
                   ┆         ┆                                         ┆           if (err$) return callback(err$);
                   ┆         ┆           await divide(10,2);           ┆           divide(10, 2, function(err$, res$5) {
                   ┆         ┆                                         ┆              if (err$) return callback(err$);
                   ┆         ┆                                         ┆              callback(null, res$1+res$2+res$3+res$4+res$5);
                   ┆         ┆                                         ┆           });
                   ┆         ┆                                         ┆         });
                   ┆         ┆                                         ┆       });
                   ┆         ┆                                         ┆     });
                   ┆         ┆                                         ┆   });
                   ┆         ┆  }                                      ┆ }

  merged           ┆ 15      ┆ async function fn() {                   ┆ function fn(callback) {
    simple         ┆         ┆    var x=10;                            ┆   var x=10;
    statements     ┆         ┆    var a=await divide(2,2);             ┆   divide(2, 2, function(err$, a) {
                   ┆         ┆                                         ┆     if (err$) return callback(err$);
                   ┆         ┆    var y=10;                            ┆     var y=10;
                   ┆         ┆    var b=await divide(4,2);             ┆     divide(4, 2, function(err$, b) {
                   ┆         ┆                                         ┆       if (err$) return callback(err$);
                   ┆         ┆    var c=await divide(6,2);             ┆       divide(6, 2, function(err$, c) {
                   ┆         ┆                                         ┆         if (err$) return callback(err$);
                   ┆         ┆                                         ┆         divide(16, 2, function(err$, res$4) {
                   ┆         ┆                                         ┆           if (err$) return callback(err$);
                   ┆         ┆    var d=await divide(16,2)/2;          ┆           var d=res$4/2;
                   ┆         ┆    var e;                               ┆           var e;
                   ┆         ┆    e=await divide(10,2);                ┆           divide(10, 2, function(err$, res$5) {
                   ┆         ┆                                         ┆              if (err$) return callback(err$);
                   ┆         ┆                                         ┆              e=res$5;
                   ┆         ┆    return x+a+b+c+d+e-y;                ┆              callback(null, x+a+b+c+d+e-y);
                   ┆         ┆                                         ┆           });
                   ┆         ┆                                         ┆         });
                   ┆         ┆                                         ┆       });
                   ┆         ┆                                         ┆     });
                   ┆         ┆                                         ┆   });
                   ┆         ┆ }                                       ┆ }
