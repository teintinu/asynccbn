Feature: declaring async functions

Scenario: Declaring [case]

    Given I need to transpile [case]
    When EcmaScript6=[EcmaScript6]
    Then EcmaScript5=[EcmaScript5]

Examples:
  case             ┆ EcmaScript6                              ┆ EcmaScript5

  async function   ┆ async function divide(a,b)               ┆ function divide(a, b, callback) {
                   ┆ {                                        ┆   callback(null, a / b);
                   ┆   return a/b;                            ┆ }
                   ┆ }                                        ┆


  async void       ┆ async function log(m)                    ┆ function log(m, callback) {
    function       ┆ {                                        ┆   console.log(m);
                   ┆   console.log(m);                        ┆   callback();
                   ┆ }                                        ┆ }


  async function   ┆ async function divide(a,b)               ┆ function divide(a, b, callback) {
    with throw     ┆ {                                        ┆   return callback("division by zero");
                   ┆   throw "division by zero";              ┆ }
                   ┆ }                                        ┆


  async function   ┆ async function divide(a,b)               ┆ function divide(a, b, callback) {
    with if        ┆ {                                        ┆   if (b<0)
                   ┆   if (b<0)                               ┆     return callback("division by zero");
                   ┆     throw "division by zero";            ┆   callback(null, a/b);
                   ┆   return a/b;                            ┆ }
                   ┆ }                                        ┆
