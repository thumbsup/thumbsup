/*
  Execute the child block N times
  Usage:
    {{#times 10}}
      <p>Lorem ipsum</p>
    {{/times}}
*/
module.exports = function (n, block) {
  let accum = ''
  const data = require('handlebars').createFrame({})
  for (let i = 0; i < n; ++i) {
    data.index = i
    accum += block.fn(this, { data })
  }
  return accum
}
