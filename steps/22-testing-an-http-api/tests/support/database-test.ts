import { test as baseTest } from "vitest";
import { openDatabase } from "../../src/database.ts";
import { OrderRepository } from "../../src/order-repository.ts";

// Fixtures for database tests. Every test that asks for "database" gets its own empty in-memory database
// with the tables already created (the schema), and the connection is closed when the test ends.
export const test = baseTest
  .extend("database", ({}, { onCleanup }) => {
    const database = openDatabase();
    onCleanup(() => database.close());
    return database;
  })
  .extend("repository", ({ database }) => new OrderRepository(database));
