import sqlite3
import json
import time
import libs.utils as utils
import libs.sys_conf as sys_conf
import random
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
    db = sqlite3.connect(path, check_same_thread=False)
    return db


def init_user_table(db: sqlite3.Connection):
    error = "None"
    try:
        cursor = db.cursor()
        query = "CREATE TABLE IF NOT EXISTS users (user_id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT NOT NULL UNIQUE,password TEXT NOT NULL,additional_info TEXT NOT NULL);"
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


def user_db_add_user(db: sqlite3.Connection, userdata: dict):
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


def user_db_get_user(db: sqlite3.Connection, q):
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
                "user_id": data[0],
                "username": data[1],
                "password": data[2],
                "additional_info": data[3],
            }
            return user
        else:
            return None


def user_db_get_all_users(db: sqlite3.Connection, show_pass: bool):
    try:
        cursor = db.cursor()
        query = "SELECT * FROM users"
        cursor.execute(query)
        db.commit()
    except sqlite3.Error as e:
        return f"An error occurred: {e}"
    finally:
        data = cursor.fetchall()
        if show_pass == False:
            output = [
                {
                    "id": i[0],
                    "username": i[1],
                    "password": "***",
                    "additional_info": i[3],
                }
                for i in data
            ]
            return output
        else:
            output = [
                {
                    "id": i[0],
                    "username": i[1],
                    "password": i[2],
                    "additional_info": i[3],
                }
                for i in data
            ]
            return output


# auth db spec


def auth_db_gen_session(db: sqlite3.Connection, userdata: str, t):
    session_token = utils.sha256(userdata + str(t) + str(random.random()))
    if auth_db_return_session(db, session_token) == None:
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
        session_token = auth_db_gen_session(db, userdata["username"], time_to_str(now))
        user_info = json.loads(userdata["additional_info"])
        if user_info["level"] != None:
            level = user_info["level"]
        else:
            level = 100
        session = {
            "session_token": session_token,
            "user_id": userdata["user_id"],
            "valid_until": time_to_str(valid_until),
            "level": level,
        }
        auth_db_purge_sessions(db, userdata["user_id"])
        if auth_db_add_session(db, session) == []:
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
        "valid_until": result[0][3],
        "level": result[0][4],
    }
    return result


def str_to_time(t_string):
    return datetime.strptime(t_string, "%Y-%m-%d %H:%M:%S.%f")


def time_to_str(t_obj):
    return datetime.strftime(t_obj, "%Y-%m-%d %H:%M:%S.%f")


def auth_db_check_session_valid(session):
    now = datetime.now()
    if str_to_time(session["valid_until"]) > now:
        return True
    else:
        return False


def auth_db_add_session(db: sqlite3.Connection, session: dict):
    error = "None"
    try:
        cursor = db.cursor()
        query = "INSERT INTO auth (session_token, user_id, valid_until, level) VALUES (?, ?, ?, ?);"
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


def auth_db_login(db: sqlite3.Connection, session_token, time):
    try:
        session = auth_db_return_session(db, session_token)
        if auth_db_check_session_valid(session):
            auth_db_update_session(db, session_token, time)
            return True
        else:
            return False
    except:
        return False


def auth_db_update_session(db: sqlite3.Connection, session_token, time):
    session = auth_db_return_session(db, session_token)
    session["valid_until"] = time_to_str(datetime.now() + timedelta(minutes=time))
    error = "None"
    try:
        cursor = db.cursor()
        query = "UPDATE auth SET user_id = ?, valid_until = ? , level = ? where session_token = ?;"
        cursor.execute(
            query,
            (
                session["user_id"],
                session["valid_until"],
                session["level"],
                session["session_token"],
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


def auth_db_purge_sessions(db: sqlite3.Connection, user_id):
    error = "None"
    try:
        cursor = db.cursor()
        query = "DELETE FROM auth WHERE user_id = ?;"
        cursor.execute(
            query,
            (user_id,),
        )
        db.commit()
    except sqlite3.Error as e:
        error = f"An error occurred: {e}"
    finally:
        if error == "None":
            return cursor.fetchall()
        else:
            return error


# session = auth_db_auth(db,{"username" : "admin","password" : "122"},30)
# print(auth_db_login(db, session["session_token"],30))

# auth_db_purge_sessions(db,user_db_get_user(db,"admin")["user_id"])
# session = auth_db_return_session(db,"80e676a2c90f598511ac93074e8b8ec577ebd2cb2925f53eef392158b80b4e1c")
# print(session["valid_until"])

# auth_db_update_session(db,session["session_token"],30)
# session = auth_db_return_session(db,"80e676a2c90f598511ac93074e8b8ec577ebd2cb2925f53eef392158b80b4e1c")
# print(session["valid_until"])
