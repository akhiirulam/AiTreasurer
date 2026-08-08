import UserRegistration, {
  IUserRegistration,
} from "../../models/userRegistration.model";

class UserLogin {
  async findByEmail(email: string): Promise<IUserRegistration | null> {
    return await UserRegistration.findOne({
      email: email.toLowerCase(),
    }).select("+password");
  }
}

export default new UserLogin();
