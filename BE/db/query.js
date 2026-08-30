/**
 * מודול: ביצוע שאילתות
 * תפקיד: הרצת שאילתות מול מסד הנתונים והחזרת התוצאות
 */

const getDbConnection = require("./dbSingleton");

// הרצת שאילתה בודדת עם פרמטרים מוגנים
async function doQuery(sql, params = []) {
  const db = await getDbConnection();
  const result = await db.query(sql, params);

  return result[0];
}

module.exports = doQuery;