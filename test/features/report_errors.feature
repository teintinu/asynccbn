Feature: Error reporting when wrong use of await

Scenario: [case]

   Given I try to transpile [case]
    When EcmaScript7 at [EcmaScript7.start.line]:[EcmaScript7.start.column] = [EcmaScript7] 
    Then must report [Error]

Examples:
  case:ID            ┆ EcmaScript7:LOC                         ┆ Error

----------------------------------------------------------------------------------------------------------------------
  in consequent      ┆ async function fn() {                   ┆ else is mandatory when await used in consequent block
  without else       ┆   if (!math)                            ┆  
                     ┆     return await divide(9,3);           ┆ 
                     ┆ }                                       ┆ 
                     
----------------------------------------------------------------------------------------------------------------------
  dead code          ┆ async function fn() {                   ┆ Dead code                                                
                     ┆   return 1;                             ┆  
                     ┆   var x=1;                              ┆ 
                     ┆ }                                       ┆ 
                     
----------------------------------------------------------------------------------------------------------------------
  throws await       ┆ async function fn() {                   ┆ Can't throw await expression                            
                     ┆   throw await divide(2,1);              ┆  
                     ┆ }                                       ┆ 
                     ┆                                         ┆ 
                     
----------------------------------------------------------------------------------------------------------------------
  throws await       ┆ async function fn() {                   ┆ Can't throw await expression                           
    in expression    ┆   throw await divide(2,1)+1;            ┆  
                     ┆ }                                       ┆ 
                     ┆                                         ┆ 
                     
----------------------------------------------------------------------------------------------------------------------
  await must invoke  ┆ async function fn() {                   ┆ AwaitExpression must invoke a function
    function         ┆   return await 1;                       ┆  
                     ┆ }                                       ┆ 
                     ┆                                         ┆ 
                     

