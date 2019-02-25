/*
  Execute a block if a condition matches
  Ideally we want to use unit-testable models instead
  However this lets theme authors be more creative without changing the core model
  Thanks to http://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/#comment-44
  Usage:
    {{#compare stars '>=' 4}}
      Good
    {{/compare}}
*/

/* eslint-disable key-spacing, no-multi-spaces, eqeqeq */
const operators = {
  '==':  function (l, r) { return l == r  },
  '===': function (l, r) { return l === r },
  '!=':  function (l, r) { return l != r  },
  '!==': function (l, r) { return l !== r },
  '<':   function (l, r) { return l < r   },
  '>':   function (l, r) { return l > r   },
  '<=':  function (l, r) { return l <= r  },
  '>=':  function (l, r) { return l >= r  },
  '||':  function (l, r) { return l || r  },
  '&&':  function (l, r) { return l && r  }
}
/* eslint-enable */

module.exports = function (lvalue, operator, rvalue, options) {
  if (arguments.length < 3) {
    throw new Error("Handlerbars Helper 'compare' needs 2 parameters")
  }
  if (options === undefined) {
    options = rvalue
    rvalue = operator
    operator = '==='
  }
  if (!operators[operator]) {
    throw new Error(`Handlerbars Helper 'compare' doesn't know the operator ${operator}`)
  }
  const result = operators[operator](lvalue, rvalue)
  if (result) {
    return options.fn(this)
  } else {
    return options.inverse(this)
  }
}
