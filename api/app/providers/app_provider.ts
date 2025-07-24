import type { ApplicationService } from '@adonisjs/core/types'

export default class AppProvider {
  constructor(protected app: ApplicationService) { }

  /**
   * Register bindings to the container
   */
  register() {
    this.app.container.bind('db', () => {
      // return new Database()
    })
  }

  /**
   * The container bindings have booted
   */
  async boot() {
    // const validator = await this.app.container.make('validator')
    // validator.rule('foo', () => {})
  }

  /**
   * The application has been booted
   */
  async start() {
    if (this.app.getEnvironment() === 'web') {
    }

    if (this.app.getEnvironment() === 'console') {
    }

    if (this.app.getEnvironment() === 'test') {
    }

    if (this.app.getEnvironment() === 'repl') {
    }
  }

  /**
   * The process has been started
   */
  async ready() { }

  /**
   * Preparing to shutdown the app
   */
  async shutdown() { }
}