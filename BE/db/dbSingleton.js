/**
 * מודול: מנהל התחברות למסד הנתונים
 * תפקיד: יצירה וניהול של מאגר חיבורים יחיד למסד הנתונים עבור כל המערכת
 */

const mysql = require("mysql2");
let pool;
const dbSingleton = {
  // החזרת מאגר החיבורים הקיים או יצירת מאגר חדש במידה ואינו קיים
  getConnection: () => {
    if (!pool) {
      pool = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "",
        database: "myproject",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      console.log("Database Pool created!");
    }
    return pool;
  },
};
module.exports = dbSingleton;