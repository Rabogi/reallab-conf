from fastapi import FastAPI
from fastapi import responses
from fastapi import Body
from fastapi.middleware.cors import CORSMiddleware
import pathlib
import os
import uvicorn
import json
import libs.utils as utils
import libs.sys_conf as sys_conf
import libs.db_handler as db_handler

# Init

app = FastAPI(docs_url=None, redoc_url=None)

# cors = CORSMiddleware(
#     app,
#     allow_origins=(),
#     allow_methods=("GET",),
#     allow_headers=(),
#     allow_credentials=False,
#     allow_origin_regex=None,
#     expose_headers=(),
#     max_age=600,
# )
# app.middleware = cors

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


if utils.exists("./config.json") == False:
    sys_conf.recreate_default_conf("./config.json")
config = json.loads(
    open(
        "./config.json",
    ).read()
)

permissions = {
    "add_user_error_message": "Добавлять пользователей запрещено с текущим уровнем доступа",
    "add_user_success_message": "Пользователь добавлен",
    "add_user": 0,
    #
    "rem_user_error_message": "Удалять пользователей запрещено с текущим уровнем доступа",
    "rem_user_success_message": "Пользователь удалён",
    "rem_user": 0,
}

# Trying to connect to DB
# Checking if db file exist at set location


def gen_folders(path):
    head, tail = os.path.split(path)
    pathlib.Path(head).mkdir(parents=True, exist_ok=True)


def regenerate(path, file):
    if utils.exists(path) == False:
        gen_folders(path)
        if file:
            open(path, "w").close()


regenerate(config["data_db_location"], True)
regenerate(config["cert_file"], False)
regenerate(config["cert_key_file"], False)

db = db_handler.connect(config["data_db_location"])


session_lifetime = config["session_lifetime"]

# DB regeneration

db_handler.init_user_table(db)
db_handler.init_auth_table(db)

if db_handler.row_count(db, "users") == 0:
    t = {"username": "admin", "password": "123", "additional_info": {"level": 0}}
    t["password"] = utils.sha512(t["password"])
    db_handler.user_db_add_user(db, t)

status = {str: str}
timezones = sys_conf.call_shell("timedatectl list-timezones").split("\n")
# Page handlers


@app.get("/")
def read_root():
    root_page = open("frontend/index.html", "r")
    page = root_page.read()
    root_page.close()
    with open("frontend/content/pages/login.html") as f:
        content = f.read()
        f.close()
    page = utils.embed_in_template(page, content, "<!-- MAIN_CONTENT  -->")
    response = responses.HTMLResponse(utils.replace_tags(page, config))
    return response


@app.get("/dashboard")
def read_dashboard():
    root_page = open("frontend/index.html", "r")
    page = root_page.read()
    root_page.close()
    with open("frontend/content/pages/dashboard.html") as f:
        content = f.read()
        f.close()
    page = utils.embed_in_template(page, content, "<!-- MAIN_CONTENT  -->")
    with open("frontend/content/pages/micropages/temps.html") as f:
        content = f.read()
        f.close()
    page = utils.embed_in_template(page, content, "<!-- TEMPS  -->")
    with open("frontend/content/pages/micropages/time.html") as f:
        content = f.read()
        f.close()
    page = utils.embed_in_template(page, content, "<!-- TIME  -->")
    with open("frontend/content/pages/micropages/host.html") as f:
        content = f.read()
        f.close()
    page = utils.embed_in_template(page, content, "<!-- HOST  -->")
    with open("frontend/content/pages/micropages/users.html") as f:
        content = f.read()
        f.close()
    page = utils.embed_in_template(page, content, "<!-- USERS  -->")
    with open("frontend/content/pages/micropages/fetchdump.html") as f:
        content = f.read()
        f.close()
    page = utils.embed_in_template(page, content, "<!-- FETCH  -->")
    response = responses.HTMLResponse(utils.replace_tags(page, config))
    return response


@app.get("/settings/load")
def read_settings_load():
    root_page = open("frontend/index.html", "r")
    page = root_page.read()
    root_page.close()
    with open("frontend/content/pages/page_template.html") as f:
        content = f.read()
        f.close()
    page = utils.embed_in_template(page, content, "<!-- MAIN_CONTENT  -->")
    page = utils.embed_in_template(page, "Ресурсы устройства", "<!-- PageNAME  -->")
    with open("frontend/content/pages/load.html") as f:
        content = f.read()
        f.close()
    page = utils.embed_in_template(page, content, "<!-- MAIN_CONTENT  -->")
    response = responses.HTMLResponse(utils.replace_tags(page, config))
    return response


@app.get("/settings/users")
def read_settings_users():
    root_page = open("frontend/index.html", "r")
    page = root_page.read()
    root_page.close()
    with open("frontend/content/pages/page_template.html") as f:
        content = f.read()
        f.close()
    page = utils.embed_in_template(page, content, "<!-- MAIN_CONTENT  -->")
    page = utils.embed_in_template(page, "Пользователи", "<!-- PageNAME  -->")
    with open("frontend/content/pages/users.html") as f:
        content = f.read()
        f.close()
    page = utils.embed_in_template(page, content, "<!-- MAIN_CONTENT  -->")
    response = responses.HTMLResponse(utils.replace_tags(page, config))
    return response


@app.get("/settings/host")
def read_settings_host():
    root_page = open("frontend/index.html", "r")
    page = root_page.read()
    root_page.close()
    with open("frontend/content/pages/page_template.html") as f:
        content = f.read()
        f.close()
    page = utils.embed_in_template(page, content, "<!-- MAIN_CONTENT  -->")
    page = utils.embed_in_template(page, "Сеть", "<!-- PageNAME  -->")
    with open("frontend/content/pages/host.html") as f:
        content = f.read()
        f.close()
    page = utils.embed_in_template(page, content, "<!-- MAIN_CONTENT  -->")
    response = responses.HTMLResponse(utils.replace_tags(page, config))
    return response


@app.get("/settings/dump")
def read_settings_dump():
    root_page = open("frontend/index.html", "r")
    page = root_page.read()
    root_page.close()
    with open("frontend/content/pages/page_template.html") as f:
        content = f.read()
        f.close()
    page = utils.embed_in_template(page, content, "<!-- MAIN_CONTENT  -->")
    page = utils.embed_in_template(page, "Доп. информация", "<!-- PageNAME  -->")
    with open("frontend/content/pages/fetchdump.html") as f:
        content = f.read()
        f.close()
    page = utils.embed_in_template(page, content, "<!-- MAIN_CONTENT  -->")
    response = responses.HTMLResponse(utils.replace_tags(page, config))
    return response


@app.get("/settings/time")
def read_settings_time():
    root_page = open("frontend/index.html", "r")
    page = root_page.read()
    root_page.close()
    with open("frontend/content/pages/page_template.html") as f:
        content = f.read()
        f.close()
    page = utils.embed_in_template(page, content, "<!-- MAIN_CONTENT  -->")
    page = utils.embed_in_template(page, "Время", "<!-- PageNAME  -->")
    with open("frontend/content/pages/time.html") as f:
        content = f.read()
        f.close()
    page = utils.embed_in_template(page, content, "<!-- MAIN_CONTENT  -->")
    response = responses.HTMLResponse(utils.replace_tags(page, config))
    return response


# Content handlers


@app.get("/content/images/{item_name}")
async def get_content(item_name: str):
    return responses.FileResponse(config["content_folder"] + "/images/" + item_name)


@app.get("/content/css/{item_name}")
async def get_content(item_name: str):
    return responses.FileResponse(config["content_folder"] + "/css/" + item_name)


@app.get("/content/js/{item_name}")
async def get_content(item_name: str):
    return responses.FileResponse(config["content_folder"] + "/js/" + item_name)


@app.get("/content/icons/{item_name}")
async def get_content(item_name: str):
    return responses.FileResponse(config["content_folder"] + "/icons/" + item_name)


# Generics


@app.get("/interfaces")
def get_interfaces():
    # return sys_conf.list_interfaces()
    return responses.JSONResponse(sys_conf.list_interfaces())


@app.get("/eth_interfaces")
def get_eth_interfaces():
    data = sys_conf.list_interfaces()
    output = ""
    for i in data.keys():
        if data[i].startswith("127") == False and data[i] != "None":
            output += i + ":" + data[i] + ""
    return responses.PlainTextResponse(output)


@app.get("/temperature")
def get_temperature():
    return sys_conf.get_temp()


@app.get("/time")
def get_time():
    return sys_conf.get_sys_time()
    # return "00:00:00"
    # return "23:59:59"


@app.get("/timezones")
def get_timezones():
    return timezones


# Auth handlers


@app.post("/auth")
def auth(data: dict = Body()):
    return db_handler.auth_db_auth(db, data, session_lifetime)


@app.post("/login")
def login(data: dict = Body()):
    if "session_token" in list(data.keys()):
        if db_handler.auth_db_login(db, data["session_token"], session_lifetime):
            return {"status": "Success"}
    return {"status": "Fail"}


@app.post("/session")
def session(data: dict = Body()):
    if "session_token" in list(data.keys()):
        if db_handler.auth_db_login(db, data["session_token"], session_lifetime):
            user = db_handler.auth_db_return_session(db, data["session_token"])
            username = db_handler.user_db_get_user(db, int(user["user_id"]))["username"]
            user["username"] = username
            dump = json.dumps(user)
            return user


@app.post("/users")
def users(data: dict = Body()):
    if "session_token" in list(data.keys()):
        if db_handler.auth_db_login(db, data["session_token"], session_lifetime):
            output = []
            pass_access = False
            return db_handler.user_db_get_all_users(db, False)


@app.post("/add_user")
def add_user(data: dict = Body()):
    if "session_token" in list(data.keys()):
        if db_handler.auth_db_login(db, data["session_token"], session_lifetime):
            if (
                db_handler.auth_db_return_session(db, data["session_token"])["level"]
                <= permissions["add_user"]
            ):
                userdata = data["userdata"]
                res = True
                for ele in ["username", "password", "additional_info"]:
                    if ele not in list(userdata.keys()):
                        res = False
                        break
                if (
                    json.loads(userdata["additional_info"])["level"]
                    < db_handler.auth_db_return_session(db, data["session_token"])[
                        "level"
                    ]
                ):
                    return {
                        "status": "Fail",
                        "message": "Нельзя создавать пользователя с таким уровнем доступа",
                    }
                if res:
                    if (
                        db_handler.user_db_add_user(
                            db,
                            {
                                "username": userdata["username"],
                                "password": userdata["password"],
                                "additional_info": userdata["additional_info"],
                            },
                        )
                        == "An error occurred: UNIQUE constraint failed: users.username"
                    ):
                        return {
                            "status": "Fail",
                            "message": "Пользователь с таким именем уже существует",
                        }
                    else:
                        return {
                            "status": "Success",
                            "message": permissions["add_user_success_message"],
                        }
                else:
                    return {"status": "Fail", "message": "Данные не полные"}
            else:
                return {
                    "status": "Fail",
                    "message": permissions["add_user_error_message"],
                }
        else:
            return {"status": "Fail", "message": "Сессия истекла"}
    else:
        return {"status": "Fail", "message": "Токен не предоставлен"}


@app.post("/rem_user")
def add_user(data: dict = Body()):
    if "session_token" in list(data.keys()):
        if db_handler.auth_db_login(db, data["session_token"], session_lifetime):
            remover = db_handler.auth_db_return_session(db, data["session_token"])
            if (
                remover["level"]
                <= permissions["rem_user"]
            ):
                userdata = data["userdata"]
                if "id" in list(userdata.keys()):
                    user = db_handler.user_db_get_user(db,userdata["id"])
                    if json.loads(user["additional_info"])["level"] < db_handler.auth_db_return_session(db, data["session_token"])["level"]:
                        return{
                            "status":"Fail",
                            "message":"Отказано в доступе",
                        }
                    if user["username"] == db_handler.user_db_get_user(db,int(remover["user_id"]))["username"]:
                        return{
                            "status":"Fail",
                            "message":"Удалить текущего пользователя нельзя",
                        }
                    db_handler.user_db_remove_user(db,user["username"])
                    return{
                        "status":"Success",
                        "message":permissions["rem_user_success_message"],
                    }
                else:
                    return {
                        "status": "Fail",
                        "message": "Нет ID",
                    }
            else:
                return {
                    "status": "Fail",
                    "message": permissions["rem_user_error_message"],
                }
        else:
            return {"status": "Fail", "message": "Сессия истекла"}
    else:
        return {"status": "Fail", "message": "Токен не предоставлен"}


@app.post("/alter_user")
def add_user(data: dict = Body()):
    if "session_token" in list(data.keys()):
        if db_handler.auth_db_login(db, data["session_token"], session_lifetime):
            print(data)


@app.post("/timedatectl")
def get_timedatectl(data: dict = Body()):
    if "session_token" in list(data.keys()):
        if db_handler.auth_db_login(db, data["session_token"], session_lifetime):
            return sys_conf.get_time_data_ctl()
    return {"status": "Fail"}


@app.post("/meminfo")
def get_timedatectl(data: dict = Body()):
    if "session_token" in list(data.keys()):
        if db_handler.auth_db_login(db, data["session_token"], session_lifetime):
            return sys_conf.get_memory()
    return {"status": "Fail"}


@app.post("/loadinfo")
def get_timedatectl(data: dict = Body()):
    if "session_token" in list(data.keys()):
        if db_handler.auth_db_login(db, data["session_token"], session_lifetime):
            return sys_conf.get_load()
    return {"status": "Fail"}


@app.post("/temperature")
def get_timedatectl(data: dict = Body()):
    if "session_token" in list(data.keys()):
        if db_handler.auth_db_login(db, data["session_token"], session_lifetime):
            return sys_conf.get_temp()
    return {"status": "Fail"}


@app.post("/resources")
def get_resinfo(data: dict = Body()):
    if "session_token" in list(data.keys()):
        if db_handler.auth_db_login(db, data["session_token"], session_lifetime):
            return dict(
                list(sys_conf.get_memory().items())
                + list(sys_conf.get_load().items())
                + list(sys_conf.get_temps().items())
                + list({"server_usage": sys_conf.get_server_mem()[1]}.items())
            )
    return {"status": "Fail"}


if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host=config["host"],
        port=config["port"],
        ssl_keyfile=os.path.realpath(config["cert_key_file"]),
        ssl_certfile=os.path.realpath(config["cert_file"]),
        reload=True,
    )
