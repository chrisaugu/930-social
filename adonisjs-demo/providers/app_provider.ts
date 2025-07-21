// import { UserService } from '#services/user_service';

export default class AppProvider {
  app: any;
  async boot() {
    
    // this.app.container.bind(UserService, () => {
    //   return this.app.container.make(UserService)
    // })
  }
}
