pm2 start ecosystem.config.js

node ace make:controller users
node ace make:controller posts --resource

node ace make:middleware user_location

node ace make:model User

node ace make:migration users

node ace migration:run --force
node ace migration:run

