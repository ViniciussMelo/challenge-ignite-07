import request from "supertest"
import jwt from "jsonwebtoken"

import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";
import { User } from "../../entities/User";
import authConfig from '../../../../config/auth';
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";

let connection: Connection;

interface ITokenUser {
  user: User,
  token: string,
}

const newUser: ICreateUserDTO = {
  name: "Test user",
  email: "user@email.com",
  password: "1234"
}

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to init a new session", async () => {
    await request(app).post("/api/v1/users").send(newUser);

    const response = await request(app).post("/api/v1/sessions").send({
      email: newUser.email,
      password: newUser.password,
    });

    const { user, token } = response.body
    const decodedToken = jwt.verify(token, authConfig.jwt.secret) as ITokenUser

    expect(response.status).toBe(200);
    expect(user).toHaveProperty("id");

    expect(decodedToken.user).toHaveProperty("id");
    expect(decodedToken.user).toHaveProperty("password");
  });

  it("should not be able to to init a new session with incorrect password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: newUser.email,
      password: "wrong password",
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to to init a new session with incorrect email", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "wrong email",
      password: newUser.password,
    });

    expect(response.status).toBe(401);
  });
});
