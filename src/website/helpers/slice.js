
/*
  Render the first X items in an array
  Usage:
    {{#slice items count=3}}
      {{name}}
    {{/slice}}
*/
module.exports = (context, block) => {
  var ret = ''
  var count = parseInt(block.hash.count)
  if (isNaN(count)) count = 1
  var i = 0
  var j = (count < context.length) ? count : context.length
  for (i, j; i < j; i++) {
    ret += block.fn(context[i])
  }
  return ret
}
