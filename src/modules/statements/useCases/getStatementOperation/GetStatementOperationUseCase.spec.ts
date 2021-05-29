import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { CreateStatementError } from "../createStatement/CreateStatementError";

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

const newUser: ICreateUserDTO = {
  name: "Test user",
  email: "user@email.com",
  password: "1234"
}

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

const statementData: ICreateStatementDTO = {
  user_id: "",
  amount: 0,
  description: "Statement Test",
  type: OperationType.DEPOSIT,
}

describe("Get Statement Operation Use Case", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it("should be able to get one statement operation", async () => {
    const user = await createUserUseCase.execute(newUser)
    const statement = await createStatementUseCase.execute({
      ...statementData,
      user_id: `${user.id}`
    })

    const response = await getStatementOperationUseCase.execute({
      user_id: `${user.id}`,
      statement_id: `${statement.id}`
    })

    expect(response).toHaveProperty("id")
    expect(response).toHaveProperty("user_id")
  });

  it("should no be able to get one statement operation if it user does not exists", async () => {
    await expect(async () => {
      const user = await createUserUseCase.execute(newUser)
      const user_id = user.id || "";

      const statement = await createStatementUseCase.execute({
        ...statementData,
        user_id
      });
      const statement_id = statement.id || "";

      await getStatementOperationUseCase.execute({
        user_id: `wrong id`,
        statement_id,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should no be able to get one statement operation if it operation does not exists", async () => {
    await expect(async () => {
      const user = await createUserUseCase.execute(newUser)
      const user_id = user.id || "";

      await createStatementUseCase.execute({
        ...statementData,
        user_id
      });

      await getStatementOperationUseCase.execute({
        user_id,
        statement_id: "wrong statement",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});

