import UserRegistration, {
  IUserRegistration,
} from "../../models/userRegistration.model";

class UserRegistrationRepository {
  async findByEmail(email: string): Promise<IUserRegistration | null> {
    return await UserRegistration.findOne({
      email: email.toLowerCase(),
    });
  }

  async findByMobileNumber(
    mobileNumber: string,
  ): Promise<IUserRegistration | null> {
    return await UserRegistration.findOne({
      mobileNumber,
    });
  }

  async create(
    userData: Partial<IUserRegistration>,
  ): Promise<IUserRegistration> {
    const user = new UserRegistration(userData);

    return await user.save();
  }
}

export default new UserRegistrationRepository();
