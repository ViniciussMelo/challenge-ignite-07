import request from "supertest";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";
import authConfig from '../../../../config/auth'
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";

let connection: Connection;

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

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get balance to get user balance by id", async () => {
    await request(app).post("/api/v1/users").send(newUser);

    const responseAuthenticate = await request(app).post("/api/v1/sessions").send({
      email: newUser.email,
      password: newUser.password
    });

    const amount = 150;

    await request(app).post("/api/v1/statements/deposit")
      .send({
        amount,
        description: statementData.description
      })
      .set({
        Authorization: `Bearer ${responseAuthenticate.body.token}`,
      });

    const response = await request(app).get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${responseAuthenticate.body.token}`,
      });

    expect(response.body.statement).toHaveLength(1);
    expect(response.body.balance).toBe(amount);
  });

  it("should no be able to get balance if it user does not exists", async () => {
    await request(app).post("/api/v1/users").send(newUser)

    const { secret, expiresIn } = authConfig.jwt;

    const token = jwt.sign({ user: newUser }, secret, {
      subject: uuid(),
      expiresIn
    })

    const response = await request(app).get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      })

    expect(response.status).toBe(404);
  });
});
