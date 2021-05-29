import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let createStatementUseCase: CreateStatementUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

const newUser: ICreateUserDTO = {
  name: "Test user",
  email: "user@email.com",
  password: "1234"
}

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Balance Use Case", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory
    );
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it("should be able to get balance to get user balance by id", async () => {
    const user = await createUserUseCase.execute(newUser);
    const user_id = user.id || "";

    const amountDeposit = 900;

    createStatementUseCase.execute({
      type: OperationType.DEPOSIT,
      user_id,
      amount: amountDeposit,
      description: "Deposit test",
    });

    const { balance } = await getBalanceUseCase.execute({ user_id });

    expect(balance).toBe(amountDeposit);
  });

  it("should no be able to get balance if it user does not exists", async () => {
    await expect(async () => {
      await getBalanceUseCase.execute({ user_id: "incorrect user" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
