import sqlite3

conn = sqlite3.connect('users.db')
cursor = conn.cursor()

cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               username TEXT UNIQUE NOT NULL,
               password TEXT NOT NULL
               );
               '''
            )

cursor.execute('''
    CREATE TABLE IF NOT EXISTS categories (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               user_id INTEGER NOT NULL,
               name TEXT NOT NULL,
               parent_id INTEGER DEFAULT NULL,
               is_watch BOOLEAN DEFAULT 0,
               total_time INTEGER DEFAULT 0,
               FOREIGN KEY (user_id) REFERENCES users(id),
               FOREIGN KEY (parent_id) references categories(id)
               );
               '''
            )

cursor.execute('''
    CREATE INDEX idx_user_id ON categories(user_id);
               ''')

conn.commit()
conn.close()