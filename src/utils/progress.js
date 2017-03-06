const pad = require('pad')
const ProgressBar = require('progress')
const util = require('util')

exports.create = function (message, count) {
  var format = ''
  if (typeof count === 'undefined') {
    format = pad(message, 20) + '[:bar] :eta'
    return new BetterProgressBar(format, 1)
  }
  if (Array.isArray(count)) count = count.length
  if (count > 0) {
    format = pad(message, 20) + '[:bar] :current/:total :eta'
    return new BetterProgressBar(format, count)
  } else {
    format = pad(message, 20) + '[:bar] up to date'
    var bar = new BetterProgressBar(format, 1)
    bar.tick(1)
    return bar
  }
}

function BetterProgressBar (format, count) {
  ProgressBar.call(this, format, { total: count, width: 25 })
  this.tick(0)
}

util.inherits(BetterProgressBar, ProgressBar)

BetterProgressBar.prototype.eta = function () {
  var ratio = this.curr / this.total
  ratio = Math.min(Math.max(ratio, 0), 1)
  var percent = ratio * 100
  var elapsed = new Date() - this.start
  return (percent === 100) ? 0 : elapsed * ((this.total / this.curr) - 1)
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
  var min = 0
  var sec = 0
  if (isNaN(ms) || !isFinite(ms)) return ''
  if (ms > 60 * 1000) {
    min = Math.floor(ms / 60 / 1000)
    return `(${min.toFixed(0)}min left)`
  } else if (ms > 10 * 1000) {
    sec = Math.floor(ms / 10000) * 10
    return `(${sec.toFixed(0)}s left)`
  } else if (ms > 0) {
    sec = ms / 1000
    return `(a few seconds left)`
  } else {
    return 'done'
  }
}
