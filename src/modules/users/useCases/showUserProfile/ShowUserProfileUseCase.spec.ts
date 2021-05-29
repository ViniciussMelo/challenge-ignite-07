import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";


let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

const newUser: ICreateUserDTO = {
  name: "User test",
  email: "user@email.com",
  password: "1234",
}

describe("Show User Profile Use Case", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory)
  });

  it("should be able to get information from an existing user by id", async () => {
    const user = await createUserUseCase.execute(newUser)

    const response = await showUserProfileUseCase.execute(user.id || "");

    expect(response).toHaveProperty("id")
  });


  it("should be able to get user information with invalid id", async () => {
    await expect(async () => {
      await showUserProfileUseCase.execute("")
    }).rejects.toBeInstanceOf(AppError);
  });
});
