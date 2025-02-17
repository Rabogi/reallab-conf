import sqlite3
import json
import time
import libs.utils as utils
import libs.sys_conf as sys_conf
from datetime import datetime
from datetime import timedelta


def db_execute(db: sqlite3.Connection, query):
    try:
        cursor = db.cursor()
        cursor.execute(query)
        db.commit()
    except sqlite3.Error as e:
        return f"An error occurred: {e}"
    finally:
        return cursor.fetchall()


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
        query = "CREATE TABLE IF NOT EXISTS auth (session_id INTEGER PRIMARY KEY AUTOINCREMENT, session_token TEXT NOT NULL UNIQUE,user_id TEXT NOT NULL, valid_until TEXT NOT NULL,level INT NOT NULL);"
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


# user db spec


def user_db_add_user(db: sqlite3.Connection, userdata : dict):
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
            (
                userdata["username"],
                userdata["password"],
                userdata["additional_info"],
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


def user_db_update_user(db: sqlite3.Connection, userdata: dict):
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


# auth db spec


def auth_db_gen_session(db: sqlite3.Connection, userdata: str, t):
    session_token = utils.sha256(userdata + str(t))
    if auth_db_return_session(db,session_token) == None:
        return session_token
    else:
        return None


def auth_db_auth(db: sqlite3.Connection, provided: dict, time_valid: int):
    if "username" in list(provided.keys()) and "password" in list(provided.keys()):
        userdata = user_db_get_user(db, provided["username"])
        if userdata is None:
            return {"error": "Wrong credentials"}
        if userdata["password"] != provided["password"]:
            return {"error": "Wrong credentials"}
        # User if found
        # Generating session data
        now = datetime.now()
        valid_until = now + timedelta(minutes=time_valid)
        session_token = auth_db_gen_session(
            db, userdata["username"], str(datetime.now())
        )
        user_info = json.loads(userdata["additional_info"])
        if user_info["level"] != None:
            level = user_info["level"]
        else:
            level = 100
        session = {
            "session_token":session_token,
            "user_id":userdata["id"],
            "valid_until":valid_until,
            "level":level,
        }
        if auth_db_add_session(db,session) == []:
            return session
        return {"error": "Auth error"}
    else:
        return {"error": "Malformed data"}


def auth_db_return_session(db: sqlite3.Connection, session: str):
    result = db_execute(
        db, 'SELECT * FROM auth WHERE session_token = "' + session + '"'
    )
    if result == None or type(result) == str or len(result) == 0:
        return None
    result = {
        "session_id": result[0][0],
        "session_token": result[0][1],
        "user_id": result[0][2],
        "level": result[0][3],
    }
    return result

def auth_db_add_session(db: sqlite3.Connection, session: dict):
    error = "None"
    try:
        cursor = db.cursor()
        query = (
            "INSERT INTO auth (session_token, user_id, valid_until, level) VALUES (?, ?, ?, ?);"
        )
        cursor.execute(
            query,
            (
                session["session_token"],
                session["user_id"],
                session["valid_until"],
                session["level"],
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
# db = sqlite3.connect("./data/data.db")
