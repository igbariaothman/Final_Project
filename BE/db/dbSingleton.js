const mysql = require("mysql2");

let pool;

const dbSingleton = {
  getConnection: () => {
    if (!pool) {
      pool = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "",
        database: "myproject",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      console.log("Database Pool created!");
    }
    return pool;
  },
};

module.exports = dbSingleton;