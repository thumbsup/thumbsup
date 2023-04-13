const delta = require('../../../src/components/index/delta')
const should = require('should/as-function')

describe('Index: delta', () => {
  describe('Scan mode: full', () => {
    it('no changes', () => {
      const database = {
        IMG_0001: 1410000000000,
        IMG_0002: 1420000000000
      }
      const disk = {
        IMG_0001: 1410000000000,
        IMG_0002: 1420000000000
      }
      const res = delta.calculate(database, disk, {})
      should(res).eql({
        unchanged: ['IMG_0001', 'IMG_0002'],
        added: [],
        modified: [],
        deleted: [],
        skipped: []
      })
    })

    it('no changes within a second', () => {
      const database = {
        IMG_0001: 1410000001000,
        IMG_0002: 1420000001000
      }
      const disk = {
        IMG_0001: 1410000001500, // 500ms later
        IMG_0002: 1420000000500 // 500ms earlier
      }
      const res = delta.calculate(database, disk, {})
      should(res).eql({
        unchanged: ['IMG_0001', 'IMG_0002'],
        added: [],
        modified: [],
        deleted: [],
        skipped: []
      })
    })

    it('new files', () => {
      const database = {
        IMG_0001: 1410000000000,
        IMG_0002: 1420000000000
      }
      const disk = {
        IMG_0001: 1410000000000,
        IMG_0002: 1420000000000,
        IMG_0003: 1430000000000
      }
      const res = delta.calculate(database, disk, {})
      should(res).eql({
        unchanged: ['IMG_0001', 'IMG_0002'],
        added: ['IMG_0003'],
        modified: [],
        deleted: [],
        skipped: []
      })
    })

    it('deleted files', () => {
      const database = {
        IMG_0001: 1410000000000,
        IMG_0002: 1420000000000
      }
      const disk = {
        IMG_0001: 1410000000000
      }
      const res = delta.calculate(database, disk, {})
      should(res).eql({
        unchanged: ['IMG_0001'],
        added: [],
        modified: [],
        deleted: ['IMG_0002'],
        skipped: []
      })
    })

    it('modified files', () => {
      const database = {
        IMG_0001: 1410000000000,
        IMG_0002: 1420000000000
      }
      const disk = {
        IMG_0001: 1410000000000,
        IMG_0002: 1420000002000
      }
      const res = delta.calculate(database, disk, {})
      should(res).eql({
        unchanged: ['IMG_0001'],
        added: [],
        modified: ['IMG_0002'],
        deleted: [],
        skipped: []
      })
    })

    it('all cases', () => {
      const database = {
        IMG_0001: 1410000000000,
        IMG_0002: 1420000000000,
        IMG_0003: 1430000000000
      }
      const disk = {
        IMG_0001: 1410000000000,
        IMG_0002: 1420000002000,
        IMG_0004: 1445000000000
      }
      const res = delta.calculate(database, disk, {})
      should(res).eql({
        unchanged: ['IMG_0001'],
        added: ['IMG_0004'],
        modified: ['IMG_0002'],
        deleted: ['IMG_0003'],
        skipped: []
      })
    })
  })

  describe('Scan mode: partial', () => {
    it('considers deleted files outside the inclusion pattern as skipped', () => {
      const database = {
        'London/IMG_0001': 1410000000000,
        'Tokyo/IMG_0002': 1420000000000
      }
      const disk = {
        'London/IMG_0001': 1410000000000
      }
      const res = delta.calculate(database, disk, {
        scanMode: 'incremental',
        include: ['London/**'],
        exclude: []
      })
      should(res).eql({
        unchanged: ['London/IMG_0001'],
        added: [],
        modified: [],
        deleted: [],
        skipped: ['Tokyo/IMG_0002']
      })
    })

    it('considers deleted files matching an exclusion pattern as skipped', () => {
      const database = {
        'London/IMG_0001': 1410000000000,
        'Tokyo/IMG_0002': 1420000000000
      }
      const disk = {
        'London/IMG_0001': 1410000000000
      }
      const res = delta.calculate(database, disk, {
        scanMode: 'incremental',
        include: [],
        exclude: ['Tokyo/**']
      })
      should(res).eql({
        unchanged: ['London/IMG_0001'],
        added: [],
        modified: [],
        deleted: [],
        skipped: ['Tokyo/IMG_0002']
      })
    })

    it('considers files inside the inclusion pattern as deleted', () => {
      const database = {
        'London/IMG_0001': 1410000000000,
        'Tokyo/IMG_0002': 1420000000000
      }
      const disk = {
        'London/IMG_0001': 1410000000000
      }
      const res = delta.calculate(database, disk, {
        scanMode: 'partial',
        include: ['**/**'],
        exclude: []
      })
      should(res).eql({
        unchanged: ['London/IMG_0001'],
        added: [],
        modified: [],
        deleted: ['Tokyo/IMG_0002'],
        skipped: []
      })
    })
  })

  describe('Scan mode: incremental', () => {
    it('considers files inside the inclusion pattern as skipped', () => {
      const database = {
        'London/IMG_0001': 1410000000000,
        'Tokyo/IMG_0002': 1420000000000
      }
      const disk = {
        'London/IMG_0001': 1410000000000
      }
      const res = delta.calculate(database, disk, {
        scanMode: 'incremental',
        include: [],
        exclude: []
      })
      should(res).eql({
        unchanged: ['London/IMG_0001'],
        added: [],
        modified: [],
        deleted: [],
        skipped: ['Tokyo/IMG_0002']
      })
    })
  })
})
