import { Database } from 'better-sqlite3';
const SQLite3: new (file: string) => Database = require('better-sqlite3');

export class SqliteHelper extends SQLite3 {
  query(sql: string, arg: any) {
    const stmt = this.prepare(sql);
    return stmt.run(arg);
  }

  select(sql: string, arg: any): any {
    const stmt = this.prepare(sql);
    return stmt.get(arg);
  }

  runInTransaction(callback: () => void) {
    try {
      this.exec('BEGIN TRANSACTION');
      callback();
      this.exec('COMMIT');
      return true;
    } catch (error) {
      console.error(error);
      this.exec('ROLLBACK');
      return false;
    }
  }
}
