class BaseDatabase {
    constructor() {
        if (new.target === BaseDatabase) {
            throw new Error("Cannot instantiate BaseDatabase directly.");
        }
    }

    async connect() {
        throw new Error("connect() must be implemented.");
    }

    async createTable(tableName, columns) {
        throw new Error("createTable() must be implemented.");
    }

    async insert(tableName, data) {
        throw new Error("insert() must be implemented.");
    }

    async query(tableName) {
        throw new Error("query() must be implemented.");
    }

    async close() {
        throw new Error("close() must be implemented.");
    }
}

export default BaseDatabase;
