import request from "supertest";

import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";

let connection: Connection;

const newUser: ICreateUserDTO = {
  name: "User test",
  email: "user@email.com",
  password: "1234",
}

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get information from an existing user by id", async () => {
    await request(app).post("/api/v1/users").send(newUser);

    const sessionUser = await request(app).post("/api/v1/sessions").send({
      email: newUser.email,
      password: newUser.password,
    });

    const { token } = sessionUser.body;

    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.body).toHaveProperty("id");
    expect(response.status).toBe(200);
  });

  it("should be able to get user information with invalid token", async () => {

    const response = await request(app).get("/api/v1/profile").set({
      Authorization: 'Bearer invalid-token',
    });

    expect(response.status).toBe(401);
  });
});
