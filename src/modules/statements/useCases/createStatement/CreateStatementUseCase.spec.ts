import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

const newUser: ICreateUserDTO = {
  name: "Test user",
  email: "user@email.com",
  password: "1234"
}

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

interface ICreateStatementDTO {
  user_id: string;
  amount: number;
  description: string;
  type: OperationType
}

const statementData: ICreateStatementDTO = {
  user_id: "",
  amount: 0,
  description: "Statement Test",
  type: OperationType.WITHDRAW
}

describe("Create Statement Use Case", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository()
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)
  });

  it("should be able to create a new statement", async () => {
    const user = await createUserUseCase.execute(newUser)

    const statement = await createStatementUseCase.execute({
      ...statementData,
      user_id: `${user.id}`
    })

    expect(statement).toHaveProperty("id");
    expect(statement.user_id).toEqual(user.id);
  });

  it("should no be able to create a new statement if user does not exists", async () => {
    await expect(async () => {
      await createStatementUseCase.execute(statementData);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to create a new statement with insufficient funds", async () => {
    const user = await createUserUseCase.execute(newUser)
    const user_id = user.id || "";

    await expect(async () => {
      await createStatementUseCase.execute({
        ...statementData,
        amount: 220,
        user_id,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
});
