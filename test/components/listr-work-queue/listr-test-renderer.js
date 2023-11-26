/*
  Special Listr renderer that
  - on every change, renders the whole task list in memory
  - accumulates all rendered data into an array
  - has this array available as `listr._renderer.output`
*/
module.exports = class ListrTestRenderer {
  static get nonTTY () {
    return true
  }

  constructor (tasks) {
    this._tasks = tasks
    this.output = []
  }

  render () {
    for (const task of this._tasks) {
      this.subscribe(task)
    }
  }

  subscribe (task) {
    task.subscribe(
      event => {
        if (event.type === 'SUBTASKS') {
          // new subtasks: subscribe to them too
          task.subtasks.forEach(sub => this.subscribe(sub))
        } else {
          // something else happened, capture all titles
          const titles = this.allTitles(this._tasks, 0)
          this.output.push(titles)
        }
      }
    )
  }

  allTitles (tasks, indent) {
    return tasks.map(task => {
      const subTitles = this.allTitles(task.subtasks, indent + 1)
      return '  '.repeat(indent) + task.title + '\n' + subTitles
    }).join('')
  }

  end () {
  }
}
