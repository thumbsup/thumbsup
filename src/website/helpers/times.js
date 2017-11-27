
/*
  Execute the child block N times
  Usage:
    {{#times 10}}
      <p>Lorem ipsum</p>
    {{/times}}
*/
module.exports = (n, block) => {
  var accum = ''
  for (var i = 0; i < n; ++i) { accum += block.fn(i) }
  return accum
}
