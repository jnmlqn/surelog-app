import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { SQLitePorter } from '@awesome-cordova-plugins/sqlite-porter/ngx';

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {

    database: any = null;

    constructor(
        private sqlite: SQLite,
        private sqlitePorter: SQLitePorter,
    ) {

    }

    async getKeyValue(key) {
        if (this.database == null) {
            this.database = await this.sqlite.create({
                name: 'surelog.db',
                location: 'default'
            });

            let sql = `
                CREATE TABLE IF NOT EXISTS surelog_db(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key TEXT, 
                    value BLOB
                );
            `;
            await this.sqlitePorter.importSqlToDb(this.database, sql)
        }

        return this.database.executeSql('SELECT * FROM surelog_db WHERE key = ?', [key]);
    }

    async getLocations(project_id, user_id) {
        if(this.database == null) {
            this.database = await this.sqlite.create({
                name: 'surelog.db',
                location: 'default'
            });

            let sql = `
                CREATE TABLE IF NOT EXISTS surelog_db(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key TEXT, 
                    value BLOB
                );
            `;
            await this.sqlitePorter.importSqlToDb(this.database, sql);
        }

        return this.database.executeSql('SELECT * FROM surelog_db WHERE key LIKE "%location%" AND key LIKE ? AND key LIKE ?', [`%${project_id}%`, `%${user_id}%`]);
    }

    saveValue(key, value) {
        return this.database.executeSql('INSERT INTO surelog_db (key, value) VALUES (?, ?)', [key, value]);
    }

    updateValue(key, value) {
        return this.database.executeSql(`UPDATE surelog_db SET value = ? WHERE key = "${key}"`, [value]);
    }
    
    deleteValue(key) {
        return this.database.executeSql(`DELETE FROM surelog_db  WHERE key = "${key}"`, []);
    }
}
