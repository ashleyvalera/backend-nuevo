import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "123456",
  database: "prestamos",
  synchronize: false,
  logging: true,
  entities: ["src/**/*.entity.ts"],
  migrations: ["src/migrations/**/*.ts"],
});