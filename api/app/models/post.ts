import { HttpContext } from '@adonisjs/core/http'
import { BaseModel } from '@adonisjs/lucid/orm'

export default class Post extends BaseModel {
    get isLiked() {
        const ctx = HttpContext.getOrFail()
        const authUserId = ctx.auth.user.id

        return !!this.likes.find((like) => {
            return like.userId === authUserId
        })
    }

    static query() {
        const ctx = HttpContext.getOrFail()
        const authUserId = ctx.auth.user.id

        return super.query().preload('likes', (query) => {
            query.where('userId', authUserId)
        })
    }
}
