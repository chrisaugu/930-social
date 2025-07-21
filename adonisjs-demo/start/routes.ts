/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router';
const PostsController = () => import('#controllers/posts_controller');
const UsersController = () => import('#controllers/users_controller');

router.on('/').renderInertia('home');
router.get('/test', async () => 'It works!');
router.get('/posts', [PostsController, 'index']);
// router.resource('posts.comments', CommentsController);
router.get('/users', [UsersController, 'index']);
