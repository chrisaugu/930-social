import { storage } from './storage.js'
import UserService from './user_service.js'
import { setTimeout } from 'node:timers/promises'

async function run(user) {
  const state = { user }

  return storage.run(state, async () => {
    await setTimeout(100)
    const userService = new UserService()
    await userService.get()
  })
}
