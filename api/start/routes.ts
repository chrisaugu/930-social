/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router
      .group(() => {
        router.get('users', () => { })
        router.get('payments', () => { })
      })
      .prefix('v1')
  })
  .prefix('api')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.get('/posts', () => {
  return {
    make: 'Hello world from the home page.'
  }
})

router.get('/posts/:id?', ({ params }) => {
  if (!params.id) {
    return 'Showing all posts'
  }

  return {
    post: `This is post with id ${params.id}`
  }
})

router.post('/posts', ({ request }) => {
  const postData = request.body()
  console.log(postData)
  return {
    message: 'Post created successfully',
    post: postData
  }
})

router.put('/posts/:id', ({ params, request }) => {
  const postId = params.id
  const postData = request.body()
  console.log(`Updating post with id ${postId}`, postData)
  return {
    message: `Post with id ${postId} updated successfully`,
    post: postData
  }
})

router.delete('/posts/:id', ({ params }) => {
  const postId = params.id
  console.log(`Deleting post with id ${postId}`)
  return {
    message: `Post with id ${postId} deleted successfully`
  }
})

router.get('/posts/:id/comments/:commentId', ({ params }) => {
  console.log(params.id)
  console.log(params.commentId)
});

router.get('/users', '#controllers/users_controller.index')
