import dotenv from "dotenv";
import mysql from "mysql2/promise";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.resolve(moduleDirectory, "../../../.env"),
});

export const mysqlOptions = {
  host: process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "agrisystem",
  waitForConnections: true,
  connectionLimit: 10,
};

export const pool = mysql.createPool(mysqlOptions);