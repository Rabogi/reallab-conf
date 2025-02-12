from fastapi import FastAPI
from fastapi import responses
import uvicorn
import json
import libs.utils as utils
import libs.sys_conf as sys_conf
import libs.db_handler as db_handler

app = FastAPI()
if utils.exists("./config.json") == False:
    sys_conf.recreate_default_conf("./config.json")
config = json.loads(open("./config.json",).read())
status = {str:str}

# {"data_db_location": "./data/data.db", "users_db_location": "./data/users.db", "host": "localhost", "port": 8000, "content_folder": "./frontend/content"}

@app.get("/")
def read_root():
    root_page = open("frontend/index.html","r")
    response = responses.HTMLResponse(utils.replace_tags(root_page.read(),config))
    root_page.close()
    return response

@app.get("/content/images/{item_name}")
async def get_content(item_name: str):
    return responses.FileResponse(config["content_folder"]+"/images/"+item_name)

@app.get("/content/css/{item_name}")
async def get_content(item_name: str):
    return responses.FileResponse(config["content_folder"]+"/css/"+item_name)

@app.get("/content/js/{item_name}")
async def get_content(item_name: str):
    return responses.FileResponse(config["content_folder"]+"/js/"+item_name)
    
@app.get("/interfaces")
def get_interfaces():
    return json.dumps(sys_conf.list_interfaces())

@app.get("/time")
def get_time():
    return sys_conf.get_sys_time()

if __name__ == "__main__":
    uvicorn.run("app:app" ,host=config["host"], port=config["port"], reload= True)
    # Trying to connect to DB
    # Checking if db file exist at set location
    if utils.exists(config["user_db_location"]) == False:
        open(config["user_db_location"],"w").close()
    
    user_db = db_handler.connect()
    db_handler.init_user_table()

