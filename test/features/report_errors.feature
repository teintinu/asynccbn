Feature: error reporting when wrong use of await

Scenario: reporting await [case]

   Given I try to transpile [case]
    When EcmaScript6 at [EcmaScript6.start.line]:[EcmaScript6.start.column] = [EcmaScript6] 
    Then must report [Error]

Examples:
  case:ID            ┆ EcmaScript6:LOC                         ┆ Error

  in consequent      ┆ async function fn() {                   ┆ else is mandatory when await used in consequent block
  without else       ┆   if (!math)                            ┆  
                     ┆     return await divide(9,3);           ┆ 
                     ┆ }                                       ┆ 
                     
