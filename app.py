from fastapi import FastAPI
from fastapi import responses
from fastapi import Body
import uvicorn
import json
import libs.utils as utils
import libs.sys_conf as sys_conf
import libs.db_handler as db_handler

# Init

app = FastAPI(docs_url=None, redoc_url=None)


if utils.exists("./config.json") == False:
    sys_conf.recreate_default_conf("./config.json")
config = json.loads(
    open(
        "./config.json",
    ).read()
)

# Trying to connect to DB
# Checking if db file exist at set location

if utils.exists(config["data_db_location"]) == False:
    open(config["data_db_location"], "w").close()

db = db_handler.connect(config["data_db_location"])
cursor = db.cursor()

# DB regeneration

db_handler.init_user_table(db)
db_handler.init_auth_table(db)

if db_handler.row_count(db, "users") == 0:
    t = {"username": "admin", "password": "123", "additional_info": {"level": 0}}
    db_handler.user_db_add_user(db, t)

status = {str: str}

# {"data_db_location": "./data/data.db", "users_db_location": "./data/users.db", "host": "localhost", "port": 8000, "content_folder": "./frontend/content"}

# Page handlers


@app.get("/")
def read_root():
    root_page = open("frontend/index.html", "r")
    page = root_page.read()
    root_page.close()
    with open("frontend/content/pages/login.html") as f:
        content = f.read()
    page = utils.embed_in_template(page,content)
    response = responses.HTMLResponse(utils.replace_tags(page, config))
    return response


# @app.get("/app")
# def read_app(data: dict = Body()):
#     if "session_token" in list(data.keys()):
#         if db_handler.auth_db_login(db, data["session_token"], 30):
#             root_page = open("frontend/index.html", "r")
#             response = responses.HTMLResponse(
#                 utils.replace_tags(root_page.read(), config)
#             )
#             root_page.close()
#             return response
#         else:
#             response = responses.RedirectResponse("/", 307)
#     else:
#         responses.RedirectResponse("/", 307)


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


# Generics


@app.get("/interfaces")
def get_interfaces():
    # return sys_conf.list_interfaces()
    return responses.JSONResponse(json.dumps(sys_conf.list_interfaces()))


@app.get("/eth_interfaces")
def get_eth_interfaces():
    data = sys_conf.list_interfaces()
    output = ""
    for i in data.keys():
        if data[i].startswith("127") == False and data[i] != "None":
            output += i + ":" + data[i] + ""
    return responses.PlainTextResponse(output)


@app.get("/time")
def get_time():
    return sys_conf.get_sys_time()
    # return "00:00:00"
    # return "23:59:59"


# Auth handlers


@app.post("/login")
def auth(data: dict = Body()):
    db = db_handler.connect(config["data_db_location"])
    return db_handler.auth_db_auth(db, data, 30)


if __name__ == "__main__":
    uvicorn.run("app:app", host=config["host"], port=config["port"], reload=True)
