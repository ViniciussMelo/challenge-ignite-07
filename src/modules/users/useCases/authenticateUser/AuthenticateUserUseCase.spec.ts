import jwt from "jsonwebtoken";

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

import authConfig from '../../../../config/auth';
import { User } from "../../entities/User";
import { AppError } from "../../../../shared/errors/AppError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

const newUser: ICreateUserDTO = {
  name: "Test user",
  email: "user@email.com",
  password: "1234"
}

interface ITokenUser {
  user: User,
  token: string,
}

describe("Authenticate user", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository()
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory)
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
  });

  it("should be able to to init a new session", async () => {
    await createUserUseCase.execute(newUser);

    const { user, token } = await authenticateUserUseCase.execute({
      password: newUser.password,
      email: newUser.email
    });

    const decodedToken = jwt.verify(token, authConfig.jwt.secret) as ITokenUser;

    expect(user).toHaveProperty("id");
    expect(user).not.toHaveProperty("password");

    expect(decodedToken.user).toHaveProperty("id");
    expect(decodedToken.user).toHaveProperty("password");
  });

  it("should not be able to to init a new session with incorrect password", async () => {
    expect(async () => {
      await createUserUseCase.execute(newUser);

      await authenticateUserUseCase.execute({
        password: 'wrong password',
        email: newUser.email,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to to init a new session with incorrect email", async () => {
    expect(async () => {
      await createUserUseCase.execute(newUser);

      await authenticateUserUseCase.execute({
        password: newUser.password,
        email: 'wrong email',
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
