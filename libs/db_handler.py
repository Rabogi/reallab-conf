import sqlite3
import json


def connect(fpath):
    db = sqlite3.connect(fpath)
    return db

def init_user_table(db : sqlite3.Connection):
    db.execute('''
    CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    additional_info TEXT
);
''')
    
def is_db_empty(db : sqlite3.Connection):
    cursor = db.cursor()
    cursor = cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
    if len(cursor.fetchall()) == 0:
        return False
    return True

def empty_test():
    db = connect("./data/data.db")
    return is_db_empty(db)

def row_count(db : sqlite3.Connection,table : str) :
    cursor = db.cursor()
    cursor.execute(f'SELECT COUNT(*) FROM {table};')
    return cursor.fetchone()[0]

def execute(db :sqlite3.Connection, query : str) :
    cursor = db.cursor()
    cursor.execute(query)
    return cursor.fetchall()

# user db spec 

def user_db_add_user(db: sqlite3.Connection, userdata = {str:object}) :
    # "user_id","username","password","additional_info"
    if type(userdata["additional_info"]) == dict:
        userdata["additional_info"] = json.dumps(userdata["additional_info"])
    if type(userdata["additional_info"]) == str:
        temp = json.loads(userdata["additional_info"],object_hook=dict[str,str])
        if len(temp.keys()) == 0:
            userdata["additional_info"] = "NULL"
    try:
        cursor = db.cursor()        
        cursor.execute('''
            INSERT INTO users (username, password, additional_info)
            VALUES (?, ?, ?);
            ''', (userdata['username'], userdata['password'], userdata['additional_info']))
        db.commit()
    finally:
        return cursor.fetchall()
    
db = connect("data/data.db")
user = {
    "username":"test2",
    "password":"test",
    "additional_info" : {"data_db_location": "./data/data.db", "users_db_location": "./data/users.db", "host": "localhost", "port": 8000, "content_folder": "./frontend/content"}
}
print(user_db_add_user(db,user))