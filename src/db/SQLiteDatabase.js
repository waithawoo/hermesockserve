import sqlite3 from 'sqlite3';
import BaseDatabase from './BaseDatabase.js';

class SQLiteDatabase extends BaseDatabase {
    constructor(dbFile) {
        super();
        this.dbFile = dbFile;
        this.db = null;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbFile, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async createTable(tableName, columns) {
        const columnDefs = columns.join(", ");
        const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefs})`;

        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run(sql, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });
    }

    async insert(tableName, data) {
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const sql = `INSERT INTO ${tableName} (${Object.keys(data).join(', ')}) VALUES (${placeholders})`;

        return new Promise((resolve, reject) => {
            this.db.run(sql, Object.values(data), function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    async query(tableName, conditions = {}) {
        let sql = `SELECT * FROM ${tableName}`;
        const conditionKeys = Object.keys(conditions);

        if (conditionKeys.length > 0) {
            const whereClauses = conditionKeys.map(key => `${key} = ?`).join(' AND ');
            sql += ` WHERE ${whereClauses}`;
        }

        return new Promise((resolve, reject) => {
            this.db.all(sql, Object.values(conditions), (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }
}

export default SQLiteDatabase;
