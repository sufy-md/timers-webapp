import sqlite3

conn = sqlite3.connect('user.db')
cursor = conn.cursor()

cursor.execute('''
    CREATE TABLE IF NOT EXISTS categories (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               name TEXT NOT NULL,
               parent_id INTEGER DEFAULT NULL,
               is_watch BOOLEAN DEFAULT 0,
               total_time INTEGER DEFAULT 0,
               FOREIGN KEY (parent_id) references categories(id)
               );
               '''
            )

conn.commit()
conn.close()