import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';
import { User } from "./entities/User";
import { Loan } from "./entities/Loan";

dotenv.config();

// Determine if we're running in Docker or locally
const isLocalDevelopment = process.env.NODE_ENV === 'development' && !process.env.DOCKER_ENV;
const host = isLocalDevelopment ? 'localhost' : (process.env.DB_HOST || 'postgres');

const AppDataSource = new DataSource({
    type: "postgres",
    host: host,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "loan_manager",
    synchronize: false,
    logging: process.env.NODE_ENV === "development",
    entities: [User, Loan],
    migrations: ["src/migrations/*.ts"],
    subscribers: ["src/subscribers/*.ts"],
});

// Initialize the DataSource when this file is imported directly by the CLI
if (require.main === module) {
    AppDataSource.initialize()
        .then(() => {
            console.log("Data Source has been initialized!");
        })
        .catch((error) => console.error("Error during Data Source initialization", error));
}

export default AppDataSource; 