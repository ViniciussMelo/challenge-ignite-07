import jwt from "jsonwebtoken";
import request from "supertest";
import { v4 as uuid } from "uuid";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";
import authConfig from '../../../../config/auth';
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

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new statement", async () => {
    await request(app).post("/api/v1/users").send(newUser);

    const responseAuthenticate = await request(app).post("/api/v1/sessions").send({
      email: newUser.email,
      password: newUser.password
    });

    const amount = 800;
    const response = await request(app).post("/api/v1/statements/deposit")
      .send({
        amount,
        description: "Deposit test"
      })
      .set({
        Authorization: `Bearer ${responseAuthenticate.body.token}`,
      });

    expect(response.body).toHaveProperty("id");
    expect(response.body.user_id).toEqual(responseAuthenticate.body.user.id);
    expect(response.body.amount).toEqual(amount);
  });

  it("should no be able to create a new statement it if insufficient funds", async () => {
    await request(app).post("/api/v1/users").send(newUser);

    const { secret, expiresIn } = authConfig.jwt;

    const token = jwt.sign({ user: newUser }, secret, {
      subject: uuid(),
      expiresIn
    });

    const response = await request(app).post("/api/v1/statements/withdraw")
      .send({
        amount: 200,
        description: "WITHDRAW test",
        type: OperationType.WITHDRAW
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });

  it("should no be able to create a new statement it if user does not exists", async () => {
    await request(app).post("/api/v1/users").send(newUser);

    const { secret, expiresIn } = authConfig.jwt;

    const token = jwt.sign({ user: newUser }, secret, {
      subject: uuid(),
      expiresIn
    });

    const response = await request(app).post("/api/v1/statements/deposit")
      .send({
        amount: 0,
        description: "Deposit description"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });
});
