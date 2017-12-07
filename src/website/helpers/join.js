/*
  Render elements of an array joined by a separator
  Usage:
    {{#join list ","}}
      {{.}}
    {{/join}}
*/
module.exports = function (array, separator, options) {
  const data = require('handlebars').createFrame({})
  const blocks = array.map((item, index) => {
    data.index = index
    return options.fn(item, {data: data})
  })
  return blocks.join(separator)
}
