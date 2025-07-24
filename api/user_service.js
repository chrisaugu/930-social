import { storage } from './storage.js'

export class UserService {
  async get() {
    const state = storage.getStore()
    console.log(`The user id is ${state.user.id}`)
  }
}
