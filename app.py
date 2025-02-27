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

@app.get("/load")
def read_root():
    root_page = open("frontend/index.html", "r")
    page = root_page.read()
    root_page.close()
    with open("frontend/content/pages/load.html") as f:
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
    return db_handler.auth_db_auth(db, data, 30)


@app.post("/login")
def login(data: dict = Body()):
    if "session_token" in list(data.keys()):
        if db_handler.auth_db_login(db, data["session_token"], 30):
            return {"status": "Success"}
    return {"status": "Fail"}


@app.post("/session")
def session(data: dict = Body()):
    if "session_token" in list(data.keys()):
        if db_handler.auth_db_login(db, data["session_token"], 30):
            user = db_handler.auth_db_return_session(db, data["session_token"])
            username = db_handler.user_db_get_user(db, int(user["user_id"]))["username"]
            user["username"] = username
            dump = json.dumps(user)
            return user


@app.post("/timedatectl")
def get_timedatectl(data: dict = Body()):
    if "session_token" in list(data.keys()):
        if db_handler.auth_db_login(db, data["session_token"], 30):
            return sys_conf.get_time_data_ctl()
    return {"status": "Fail"}

@app.post("/meminfo")
def get_timedatectl(data: dict = Body()):
    if "session_token" in list(data.keys()):
        if db_handler.auth_db_login(db, data["session_token"], 30):
            return sys_conf.get_memory()
    return {"status": "Fail"}

@app.post("/loadinfo")
def get_timedatectl(data: dict = Body()):
    if "session_token" in list(data.keys()):
        if db_handler.auth_db_login(db, data["session_token"], 30):
            return sys_conf.get_load()
    return {"status": "Fail"}

@app.post("/temperature")
def get_timedatectl(data: dict = Body()):
    if "session_token" in list(data.keys()):
        if db_handler.auth_db_login(db, data["session_token"], 30):
            return sys_conf.get_temp()
    return {"status": "Fail"}

@app.post("/resources")
def get_resinfo(data: dict = Body()):
    if "session_token" in list(data.keys()):
        if db_handler.auth_db_login(db, data["session_token"], 30):
            return dict(list(sys_conf.get_memory().items())+list(sys_conf.get_load().items())+list(sys_conf.get_temps().items()))
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
