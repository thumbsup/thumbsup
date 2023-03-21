
/*
  Render the first X items in an array
  Usage:
    {{#slice items count=3}}
      {{name}}
    {{/slice}}
*/
module.exports = (context, block) => {
  let ret = ''
  let count = parseInt(block.hash.count)
  if (isNaN(count)) count = 1
  let i = 0
  const j = (count < context.length) ? count : context.length
  for (i, j; i < j; i++) {
    ret += block.fn(context[i])
  }
  return ret
}
