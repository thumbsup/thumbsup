const pad = require('pad')
const ProgressBar = require('progress')
const util = require('util')

function BetterProgressBar (message, count) {
  if (count > 0) {
    var format = pad(message, 20) + '[:bar] :current/:total files :eta'
    ProgressBar.call(this, format, { total: count, width: 20 })
    this.tick(0)
  } else {
    var format = pad(message, 20) + '[:bar] up to date'
    ProgressBar.call(this, format, { total: 1, width: 20, incomplete: '=' })
    this.tick(1)
  }
}

util.inherits(BetterProgressBar, ProgressBar)

BetterProgressBar.prototype.eta = function () {
  var ratio = this.curr / this.total
  ratio = Math.min(Math.max(ratio, 0), 1)
  var percent = ratio * 100
  var elapsed = new Date - this.start
  return (percent == 100) ? 0 : elapsed * (this.total / this.curr - 1)
}

BetterProgressBar.prototype.render = function (tokens) {
  const str = formatEta(this.eta())
  const actualFormat = this.fmt
  // improve display of ETA
  this.fmt = this.fmt.replace(':eta', str)
  ProgressBar.prototype.render.call(this, tokens)
  this.fmt = actualFormat
}

function formatEta (ms) {
  if (isNaN(ms) || !isFinite(ms)) return '(calculating...)'
  if (ms > 60 * 1000) {
    var min = Math.floor(ms / 60 / 1000)
    return `(${min.toFixed(0)}min left)`
  } else if (ms > 10 * 1000) {
    var sec = Math.floor(ms / 10000) * 10
    return `(${sec.toFixed(0)}s left)`
  } else if (ms > 0) {
    var sec = ms / 1000
    return `(a few seconds left)`
  } else {
    return ''
  }
}

exports.create = function(message, count) {
  return new BetterProgressBar(message, count)
}
