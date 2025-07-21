import { HttpContext } from "@adonisjs/core/http";
import User from '#models/user';

export default class UserService {
    constructor(
        private ctx: HttpContext
    ) {
    }

    all() {
      // return users from db
      console.log(this.ctx.auth.user);
    }

    async create() {
    /**
     * Create a new user
    */
    const user = await User.create({
      username: 'rlanz',
      email: 'romain@adonisjs.com',
    })
    return user;
    }

    async find() {
    /**
     * Find a user by primary key
     */
    const user = await User.find(1)
    // const user = await User.query().where('username', 'rlanz').first()
    return user;
    }

    async update() {
    /**
     * Update a user
     */

    const user = await User.find(1)
    user?.username = 'romain'
    await user?.save()
    }

    async delete() {
    /**
     * Delete a user
     */
    const user = await User.find(1)
    await user?.delete()
    }

  }
  