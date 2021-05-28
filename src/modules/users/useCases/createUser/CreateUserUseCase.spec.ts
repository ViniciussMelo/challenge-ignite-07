import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

const newUser: ICreateUserDTO = {
  name: "User test",
  email: "user@email.com",
  password: "1234",
}

describe("Create user", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute(newUser);

    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("password")
    expect(user.name).toEqual(newUser.name)
    expect(user.email).toEqual(newUser.email)
  });

  it("should not be able to create a new user if the user already exists", async () => {
    expect(async () => {
      await createUserUseCase.execute(newUser);
      await createUserUseCase.execute(newUser);
    }).rejects.toBeInstanceOf(AppError);
  });
});
