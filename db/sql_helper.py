import bcrypt
import sqlite3

DATABASE = 'db/users.db'

def __init__():
    return

class auth_helper:
    def __init__(self, username : str, password : str) -> None:
        self.username = username
        self.password = password

        self.conn = sqlite3.connect(DATABASE)
        self.cursor = self.conn.cursor()
    
    def signup(self):
        self.cursor.execute("SELECT id FROM users WHERE username = ?", (self.username, ))
        if self.cursor.fetchone():
            self.conn.close()
            return False
        
        hashed_pw = bcrypt.hashpw(self.password.encode(), bcrypt.gensalt()).decode()
        self.cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (self.username, hashed_pw))
        id = self.cursor.execute("SELECT id FROM users WHERE username = ?", (self.username, )).fetchone()[0]
        self.cursor.execute("INSERT INTO categories (user_id, name) VALUES (?, ?)", (id, 'Uncategorised'))

        self.conn.commit()
        self.conn.close()

        return True
    
    def login(self):
        self.cursor.execute("SELECT id, password FROM users WHERE username = ?", (self.username, ))
        user = self.cursor.fetchone()
        self.conn.close()

        if (user and bcrypt.checkpw(self.password.encode(), user[1].encode())): return user[0]
        return 0

class helper:
    def __init__(self, user_id):
        self.user_id = user_id

        self.conn = sqlite3.connect(DATABASE)
        self.cursor = self.conn.cursor()
    
    def fetch_categories(self) -> dict:
        query = "SELECT id, name, parent_id, is_watch, total_time FROM categories WHERE user_id = ?"
        self.cursor.execute(query, (self.user_id, ))
        entries = self.cursor.fetchall()
        self.conn.close()

        hierarchy = {}
        for entry in entries:
            entry_id, name, parent, is_watch, total_time = entry
            hierarchy[entry_id] = {
                "name": name,
                "parent": parent,
                "is_watch": bool(is_watch),
                "subcategories": [],
                "total_time": total_time
            }
        
        for entry_id, entry_data in hierarchy.items():
            if entry_data["parent"]:
                hierarchy[entry_data["parent"]]["subcategories"].append(entry_id)
        
        # print(hierarchy)
        return hierarchy
    
    def create_watch(self, parent, name):
        # query = "SELECT * FROM categories WHERE user_id=? AND (parent_id IS ? OR parent_id = ?) AND name=?"
        # self.cursor.execute(query, (self.user_id, parent, parent, name))

        if parent is None:
            query = "SELECT * FROM categories WHERE user_id=? AND parent_id IS NULL AND name=?"
            self.cursor.execute(query, (self.user_id, name))
        else:
            query = "SELECT * FROM categories WHERE user_id=? AND parent_id=? AND name=?"
            self.cursor.execute(query, (self.user_id, parent, name))

        if self.cursor.fetchone():
            self.conn.close()
            return 0

        query = "INSERT INTO categories (user_id, name, parent_id, is_watch) VALUES (?, ?, ?, ?)"
        self.cursor.execute(query, (self.user_id, name, parent, 1))

        self.conn.commit()
        self.conn.close()

        return 1
    
    def create_category(self, parent, name):
        query = "INSERT INTO categories (user_id, name, parent_id) VALUES (?, ?, ?)"
        self.cursor.execute(query, (self.user_id, name, parent))
        self.conn.commit()
        self.conn.close()

        return 1
    
    def add_time(self, watch_id, time):
        query = "SELECT total_time FROM categories WHERE user_id=? AND id=?"
        self.cursor.execute(query, (self.user_id, watch_id))
        t = self.cursor.fetchone()
        if (not t):
            self.conn.close()
            return False

        total_time = int(t[0])
        new_total = total_time + time

        query = "UPDATE categories SET total_time=? WHERE id=?"
        self.cursor.execute(query, (new_total, watch_id))
        self.conn.commit()
        self.conn.close()

        return True