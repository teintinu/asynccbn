Scenario: [case]

    Given I need to transpile [case] with [options]
    When EcmaScript6=[EcmaScript6]
    Then EcmaScript5=[EcmaScript5]

Examples:
  case             ┆ EcmaScript6                              ┆ EcmaScript5

  async function   ┆ async function divide(a,b)               ┆ function divideAsync(a,b,callback)
                   ┆ {                                        ┆ {
                   ┆   return a/b;                            ┆   callback(null, a/b);
                   ┆ }                                        | }

  async function   ┆ async function divide(a,b)               ┆ function divideAsync(a,b,callback)
    with throw     ┆ {                                        ┆ {
                   ┆   if (b<0)                               ┆   if (b<0)
                   ┆     throw "division by zero";            ┆     return callback("division by zero");
                   ┆   return a/b;                            ┆   callback(null, a/b);
                   ┆ }                                        | }

  async void       ┆ async function log(m)                    ┆ function log(m,callback)
    function       ┆ {                                        ┆ {
                   ┆   console.log(m);                        ┆   console.log(m);
                   ┆ }                                        ┆   callback();
                   ┆                                          | }

