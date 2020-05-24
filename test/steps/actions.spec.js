const downsize = require('thumbsup-downsize')
const fs = require('fs-extra')
const should = require('should/as-function')
const sinon = require('sinon')
const actions = require('../../src/steps/actions')

const ANY_TASK = {
  src: 'input/IMG_0001.jpg',
  dest: 'output/media/IMG_0001.jpg'
}

describe('actions', () => {
  beforeEach(() => {
    sinon.stub(fs, 'copy').yields(null)
    sinon.stub(fs, 'symlink').yields(null)
    sinon.stub(downsize, 'image').yields(null)
    sinon.stub(downsize, 'video').yields(null)
    sinon.stub(downsize, 'still').yields(null)
  })

  afterEach(() => {
    fs.copy.restore()
    fs.symlink.restore()
    downsize.image.restore()
    downsize.video.restore()
    downsize.still.restore()
  })

  it('fs:copy = copies the original', testEnd => {
    const map = actions.createMap({})
    const action = map['fs:copy']
    action(ANY_TASK, err => {
      should(err).eql(null)
      sinon.assert.calledWith(fs.copy,
        ANY_TASK.src,
        ANY_TASK.dest,
        sinon.match.func
      )
      testEnd()
    })
  })

  it('fs:symlink = creates a symbolic link', testEnd => {
    const map = actions.createMap({})
    const action = map['fs:symlink']
    action(ANY_TASK, err => {
      should(err).eql(null)
      sinon.assert.calledWith(fs.symlink,
        ANY_TASK.src,
        ANY_TASK.dest,
        sinon.match.func
      )
      testEnd()
    })
  })

  it('fs:link = does nothing', testEnd => {
    const map = actions.createMap({})
    const action = map['fs:link']
    should(action).undefined()
    testEnd()
  })

  it('photo:thumbnail = creates a square thumbnail', testEnd => {
    const map = actions.createMap({ thumbSize: 200 })
    const action = map['photo:thumbnail']
    action(ANY_TASK, err => {
      should(err).eql(null)
      const downsizeArgs = shouldCallDownsize(downsize.image)
      should(downsizeArgs).property('height', 200)
      should(downsizeArgs).property('width', 200)
      should(downsizeArgs.animated).undefined() // don't animate GIF thumbnails
      testEnd()
    })
  })

  it('photo:large = creates a large image', testEnd => {
    const map = actions.createMap({ largeSize: 1000 })
    const action = map['photo:large']
    action(ANY_TASK, err => {
      should(err).eql(null)
      const downsizeArgs = shouldCallDownsize(downsize.image)
      should(downsizeArgs).property('height', 1000)
      should(downsizeArgs).property('animated', true)
      testEnd()
    })
  })

  it('video:thumbnail = creates a square video still', testEnd => {
    const map = actions.createMap({ thumbSize: 200 })
    const action = map['video:thumbnail']
    action(ANY_TASK, err => {
      should(err).eql(null)
      const downsizeArgs = shouldCallDownsize(downsize.still)
      should(downsizeArgs).property('height', 200)
      should(downsizeArgs).property('width', 200)
      testEnd()
    })
  })

  it('video:poster = creates a large video still', testEnd => {
    const map = actions.createMap({ largeSize: 1000 })
    const action = map['video:poster']
    action(ANY_TASK, err => {
      should(err).eql(null)
      const downsizeArgs = shouldCallDownsize(downsize.still)
      should(downsizeArgs).property('height', 1000)
      testEnd()
    })
  })

  it('video:poster can seek to a given number of seconds', testEnd => {
    const map = actions.createMap({ videoStills: 'seek', videoStillsSeek: 5 })
    const action = map['video:poster']
    action(ANY_TASK, err => {
      should(err).eql(null)
      const downsizeArgs = shouldCallDownsize(downsize.still)
      should(downsizeArgs).property('seek', 5)
      testEnd()
    })
  })

  it('video:poster can seek to the middle', testEnd => {
    const map = actions.createMap({ videoStills: 'middle' })
    const action = map['video:poster']
    action(ANY_TASK, err => {
      should(err).eql(null)
      const downsizeArgs = shouldCallDownsize(downsize.still)
      should(downsizeArgs).property('seek', -1)
      testEnd()
    })
  })

  it('video:resized = creates a web-friendly video', testEnd => {
    const map = actions.createMap({})
    const action = map['video:resized']
    action(ANY_TASK, err => {
      should(err).eql(null)
      const downsizeArgs = shouldCallDownsize(downsize.video)
      should(downsizeArgs).eql({
        format: undefined,
        quality: undefined,
        bitrate: undefined
      })
      testEnd()
    })
  })

  it('can specify options for video:resized', testEnd => {
    const map = actions.createMap({
      // note: some options are mutually exclusive
      // but this is OK for testing the mapping
      videoFormat: 'mp4',
      videoQuality: 75,
      videoBitrate: '1200k'
    })
    const action = map['video:resized']
    action(ANY_TASK, err => {
      should(err).eql(null)
      const downsizeArgs = shouldCallDownsize(downsize.video)
      should(downsizeArgs).eql({
        format: 'mp4',
        quality: 75,
        bitrate: '1200k'
      })
      testEnd()
    })
  })

  describe('watermark', () => {
    it('can add a watermark to large images', testEnd => {
      const map = actions.createMap({ watermark: 'copyright.jpg' })
      const action = map['photo:large']
      action(ANY_TASK, err => {
        should(err).eql(null)
        const downsizeArgs = shouldCallDownsize(downsize.image)
        should(downsizeArgs).propertyByPath('watermark', 'file').eql('copyright.jpg')
        testEnd()
      })
    })

    it('ignores the watermark for thumbnails', testEnd => {
      // it's not supported by <downsize> anyway
      const map = actions.createMap({ watermark: 'copyright.jpg' })
      const action = map['photo:thumbnail']
      action(ANY_TASK, err => {
        should(err).eql(null)
        const downsizeArgs = shouldCallDownsize(downsize.image)
        should(downsizeArgs.watermark).undefined()
        testEnd()
      })
    })
  })
})

function shouldCallDownsize (fn) {
  sinon.assert.calledWith(fn,
    ANY_TASK.src,
    ANY_TASK.dest,
    sinon.match.object,
    sinon.match.func
  )
  return fn.args[0][2]
}
