/** @type { import("drizzle-kit").Config } */
module.exports = {
    schema: "./app/db/schema.js",
    out: "./drizzle",
    driver: "better-sqlite",
    dbCredentials: {
        url: "sqlite.db"
    },
    verbose: true,
    strict: true,
    target: "node"
};