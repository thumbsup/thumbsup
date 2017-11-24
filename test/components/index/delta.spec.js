const delta = require('../../../src/components/index/delta')
const should = require('should/as-function')

describe('Index: delta', () => {
  it('no changes', () => {
    const database = {
      'IMG_0001': 1410000000000,
      'IMG_0002': 1420000000000
    }
    const disk = {
      'IMG_0001': 1410000000000,
      'IMG_0002': 1420000000000
    }
    const res = delta.calculate(database, disk)
    should(res).eql({
      unchanged: ['IMG_0001', 'IMG_0002'],
      added: [],
      modified: [],
      deleted: []
    })
  })

  it('no changes within a second', () => {
    const database = {
      'IMG_0001': 1410000001000,
      'IMG_0002': 1420000001000
    }
    const disk = {
      'IMG_0001': 1410000001500,  // 500ms later
      'IMG_0002': 1420000000500   // 500ms earlier
    }
    const res = delta.calculate(database, disk)
    should(res).eql({
      unchanged: ['IMG_0001', 'IMG_0002'],
      added: [],
      modified: [],
      deleted: []
    })
  })

  it('new files', () => {
    const database = {
      'IMG_0001': 1410000000000,
      'IMG_0002': 1420000000000
    }
    const disk = {
      'IMG_0001': 1410000000000,
      'IMG_0002': 1420000000000,
      'IMG_0003': 1430000000000
    }
    const res = delta.calculate(database, disk)
    should(res).eql({
      unchanged: ['IMG_0001', 'IMG_0002'],
      added: ['IMG_0003'],
      modified: [],
      deleted: []
    })
  })

  it('deleted files', () => {
    const database = {
      'IMG_0001': 1410000000000,
      'IMG_0002': 1420000000000
    }
    const disk = {
      'IMG_0001': 1410000000000
    }
    const res = delta.calculate(database, disk)
    should(res).eql({
      unchanged: ['IMG_0001'],
      added: [],
      modified: [],
      deleted: ['IMG_0002']
    })
  })

  it('modified files', () => {
    const database = {
      'IMG_0001': 1410000000000,
      'IMG_0002': 1420000000000
    }
    const disk = {
      'IMG_0001': 1410000000000,
      'IMG_0002': 1420000002000
    }
    const res = delta.calculate(database, disk)
    should(res).eql({
      unchanged: ['IMG_0001'],
      added: [],
      modified: ['IMG_0002'],
      deleted: []
    })
  })

  it('all cases', () => {
    const database = {
      'IMG_0001': 1410000000000,
      'IMG_0002': 1420000000000,
      'IMG_0003': 1430000000000
    }
    const disk = {
      'IMG_0001': 1410000000000,
      'IMG_0002': 1420000002000,
      'IMG_0004': 1445000000000
    }
    const res = delta.calculate(database, disk)
    should(res).eql({
      unchanged: ['IMG_0001'],
      added: ['IMG_0004'],
      modified: ['IMG_0002'],
      deleted: ['IMG_0003']
    })
  })
})
