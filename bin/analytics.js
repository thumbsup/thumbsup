const Insight = require('insight')
const path = require('path')
const pkg = require(path.join(__dirname, '..', 'package.json'))

// Google Analytics tracking code
const TRACKING_CODE = 'UA-110087713-3'

class Analytics {
  constructor ({ enabled }) {
    this.enabled = enabled
    this.insight = new Insight({ trackingCode: TRACKING_CODE, pkg })
    this.insight.optOut = !enabled
  }

  // report that the gallery has started building
  start (done) {
    this.insight.track('start')
  }

  // report that the gallery has finished building + some stats
  finish (stats, done) {
    this.insight.track('finish')
    this.insight.trackEvent({ category: 'gallery', action: 'albums', label: 'Album count', value: stats.albums })
    this.insight.trackEvent({ category: 'gallery', action: 'photos', label: 'Photo count', value: stats.photos })
    this.insight.trackEvent({ category: 'gallery', action: 'videos', label: 'Video count', value: stats.videos })
  }

  // report that an error happened
  // but don't report the contents (might contain file paths etc)
  error (done) {
    this.insight.track('error')
  }
}

module.exports = Analytics
