from fastapi import FastAPI
from fastapi import responses
import utils
import uvicorn
import sqlite3
import json
from os import path
import sysconf

app = FastAPI()
if path.exists("./config.json") == False:
    sysconf.recreate_default_conf("./config.json")
config = json.loads(open("./config.json",).read())

@app.get("/")
def read_root():
    # return {"Hello": "World"}
    root_page = open("frontend/index.html","r")
    response = responses.HTMLResponse(utils.replace_tags(root_page.read(),config))
    root_page.close()
    return response

@app.get("/content/images/{item_name}")
async def get_content(item_name: str):
    return responses.FileResponse(config["content_folder"]+"/images/"+item_name)
    

@app.get("/interfaces")
def get_interfaces():
    return json.dumps(sysconf.list_interfaces())

if __name__ == "__main__":
    uvicorn.run("app:app" ,host=config["host"], port=config["port"], reload= True)
    # Trying to connect to DB
    # Checking if db file exist at set location
    if path.exists(config["data_db_location"]) == False:
        open(config["data_db_location"],"w").close()

    data_db = sqlite3.connect(config["data_db_location"])