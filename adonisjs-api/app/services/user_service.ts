import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

@inject()
export default class UserService {
    constructor(protected ctx: HttpContext) { }

    all() {
        const ctx = HttpContext.getOrFail();
        console.log("UserService: all() called", ctx.request.url());
    }
}