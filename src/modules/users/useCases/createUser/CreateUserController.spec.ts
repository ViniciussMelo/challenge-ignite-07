import request from "supertest";

import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { ICreateUserDTO } from "./ICreateUserDTO";

let connection: Connection;

const newUser: ICreateUserDTO = {
  name: "User test",
  email: "user@email.com",
  password: "1234",
}

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send(newUser);

    expect(response.status).toBe(201);
  });

  it("should not be able to create a new user if it already exists", async () => {
    const response = await request(app).post("/api/v1/users").send(newUser);

    expect(response.status).toBe(400);
  });
});
