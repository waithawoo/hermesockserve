import SQLiteDatabase from './SQLiteDatabase.js';

class Database {
    static createDatabase(type, config) {
        switch (type) {
            case 'sqlite':
                return new SQLiteDatabase(config.dbFile);
            default:
                throw new Error("Unsupported database type");
        }
    }
}

export default Database;
