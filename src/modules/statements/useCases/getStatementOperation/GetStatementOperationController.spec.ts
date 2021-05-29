import request from "supertest";
import { v4 as uuid } from "uuid"

import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";

let connection: Connection;

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

const newUser: ICreateUserDTO = {
  name: "Test user",
  email: "user@email.com",
  password: "1234"
}

const statementData: ICreateStatementDTO = {
  user_id: "",
  amount: 0,
  description: "Statement Test",
  type: OperationType.WITHDRAW
}

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get one statement operation", async () => {
    await request(app).post("/api/v1/users").send(newUser);

    const responseAuthenticate = await request(app).post("/api/v1/sessions").send({
      email: newUser.email,
      password: newUser.password
    });

    const responseDeposit = await request(app).post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: statementData.description
      })
      .set({
        Authorization: `Bearer ${responseAuthenticate.body.token}`,
      });

    const responseWithdraw = await request(app).post("/api/v1/statements/withdraw")
      .send({
        amount: 400,
        description: statementData.description
      })
      .set({
        Authorization: `Bearer ${responseAuthenticate.body.token}`,
      });

    const response = await request(app).get(`/api/v1/statements/${responseWithdraw.body.id}`)
      .set({
        Authorization: `Bearer ${responseAuthenticate.body.token}`,
      });

    const statementDepositResponse = await request(app).get(`/api/v1/statements/${responseDeposit.body.id}`)
      .set({
        Authorization: `Bearer ${responseAuthenticate.body.token}`,
      });

    expect(response.body).toHaveProperty("id");
    expect(response.body.type).toBe(OperationType.WITHDRAW);
    expect(response.body.amount).toBe("400.00");

    expect(statementDepositResponse.body).toHaveProperty("id");
    expect(statementDepositResponse.body.type).toBe(OperationType.DEPOSIT);
    expect(statementDepositResponse.body.amount).toBe("500.00");
  });

  it("should not be able to get one statement operation with invalid token", async () => {
    await request(app).post("/api/v1/users").send(newUser);

    const responseAuthenticate = await request(app).post("/api/v1/sessions").send({
      email: newUser.email,
      password: newUser.password
    });

    const responseDeposit = await request(app).post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: statementData.description
      })
      .set({
        Authorization: `Bearer ${responseAuthenticate.body.token}`,
      });

    const response = await request(app).get(`/api/v1/statements/${responseDeposit.body.id}`)
      .set({
        Authorization: `Bearer invalid-token`,
      });

    expect(response.status).toBe(401);
  });

  it("should not be able to get one statement operation with if it does not exists", async () => {
    await request(app).post("/api/v1/users").send(newUser);

    const responseAuthenticate = await request(app).post("/api/v1/sessions").send({
      email: newUser.email,
      password: newUser.password,
    });

    const response = await request(app).get(`/api/v1/statements/${uuid()}`)
      .set({
        Authorization: `Bearer ${responseAuthenticate.body.token}`,
      });

    expect(response.status).toBe(404);
  });
});
