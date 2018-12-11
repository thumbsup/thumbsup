/*
  Execute the child block N times
  Usage:
    {{#times 10}}
      <p>Lorem ipsum</p>
    {{/times}}
*/
module.exports = function (n, block) {
  var accum = ''
  const data = require('handlebars').createFrame({})
  for (var i = 0; i < n; ++i) {
    data.index = i
    accum += block.fn(this, { data: data })
  }
  return accum
}
