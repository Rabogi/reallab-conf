import sqlite3
import json


def connect(path):
    db = sqlite3.connect(path)
    return db


def init_user_table(db: sqlite3.Connection):
    error = "None"
    try:
        cursor = db.cursor()
        query = "CREATE TABLE IF NOT EXISTS users (user_id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT NOT NULL UNIQUE,password TEXT NOT NULL,additional_info TEXT);"
        cursor.execute(
            query,
            (),
        )
        db.commit()
    except sqlite3.Error as e:
        error = f"An error occurred: {e}"
    finally:
        if error == "None":
            return cursor.fetchall()
        else:
            return error


def init_auth_table(db: sqlite3.Connection):
    error = "None"
    try:
        cursor = db.cursor()
        query = "CREATE TABLE IF NOT EXISTS auth (session_id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT NOT NULL, valid_until TEXT NOT NULL,level INT NOT NULL,additional_info TEXT);"
        cursor.execute(
            query,
            (),
        )
        db.commit()
    except sqlite3.Error as e:
        error = f"An error occurred: {e}"
    finally:
        if error == "None":
            return cursor.fetchall()
        else:
            return error


def is_db_empty(db: sqlite3.Connection):
    cursor = db.cursor()
    cursor = cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
    )
    if len(cursor.fetchall()) == 0:
        return False
    return True


def empty_test():
    db = connect("./data/data.db")
    return is_db_empty(db)


def row_count(db: sqlite3.Connection, table: str):
    cursor = db.cursor()
    cursor.execute(f"SELECT COUNT(*) FROM {table};")
    return cursor.fetchone()[0]


def execute(db: sqlite3.Connection, query: str):
    cursor = db.cursor()
    cursor.execute(query)
    return cursor.fetchall()


# user db spec


def user_db_add_user(db: sqlite3.Connection, userdata={str: any}):
    # "user_id","username","password","additional_info"
    if type(userdata["additional_info"]) == dict:
        userdata["additional_info"] = json.dumps(userdata["additional_info"])
    if type(userdata["additional_info"]) == str:
        temp = json.loads(userdata["additional_info"], object_hook=dict[str, str])
        if len(temp.keys()) == 0:
            userdata["additional_info"] = "NULL"
    error = "None"
    try:
        cursor = db.cursor()
        query = (
            "INSERT INTO users (username, password, additional_info) VALUES (?, ?, ?);"
        )
        cursor.execute(
            query,
            (userdata["username"], userdata["password"], userdata["additional_info"],),
        )
        db.commit()
    except sqlite3.Error as e:
        error = f"An error occurred: {e}"
    finally:
        if error == "None":
            return cursor.fetchall()
        else:
            return error


def user_db_remove_user(db: sqlite3.Connection, username):
    try:
        cursor = db.cursor()
        query = "DELETE FROM users WHERE username = ?"
        cursor.execute(query, (username,))
        db.commit()
    except sqlite3.Error as e:
        return f"An error occurred: {e}"
    finally:
        return cursor.fetchall()


def user_db_update_user(db: sqlite3.Connection, userdata={str: str}):
    if type(userdata["additional_info"]) == dict:
        userdata["additional_info"] = json.dumps(userdata["additional_info"])
    if type(userdata["additional_info"]) == str:
        temp = json.loads(userdata["additional_info"], object_hook=dict[str, str])
        if len(temp.keys()) == 0:
            userdata["additional_info"] = "NULL"
    error = "None"
    try:
        cursor = db.cursor()
        query = "UPDATE users SET username = ?, password = ?, additional_info = ? where user_id = ?;"
        cursor.execute(
            query,
            (
                userdata["username"],
                userdata["password"],
                userdata["additional_info"],
                userdata["id"],
            ),
        )
        db.commit()
    except sqlite3.Error as e:
        error = f"An error occurred: {e}"
    finally:
        if error == "None":
            return cursor.fetchall()
        else:
            return error


def user_db_get_user(db: sqlite3.Connection, q: str | int):
    try:
        cursor = db.cursor()
        query = ""
        if type(q) == str:
            query = "SELECT * FROM users WHERE username = ?"
        if type(q) == int:
            query = "SELECT * FROM users WHERE user_id = ?"
        cursor.execute(query, (q,))
        db.commit()
    except sqlite3.Error as e:
        return f"An error occurred: {e}"
    finally:
        data = cursor.fetchall()
        if len(data) > 0:
            data = list(data[0])
            user = {
                "id": data[0],
                "username": data[1],
                "password": data[2],
                "additional_info": data[3],
            }
            return user
        else:
            return None