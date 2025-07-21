import UserService from '#services/user_service';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

export default class UsersController {
    @inject()
    async index(ctx: HttpContext, userService: UserService) {
        return userService.all();
    }

    async about({ view }) {
        return view.render('about');
    }

    async contact({ view }) {
        return view.render('contact');
    }
}