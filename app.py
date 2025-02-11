from fastapi import FastAPI
from fastapi import responses
import uvicorn
import sqlite3
import json
from os import path
import sysconf

app = FastAPI()
config = json.loads(open("./config.json",).read())

@app.get("/")
def read_root():
    # return {"Hello": "World"}
    root_page = open("frontend/index.html","r")
    response = responses.HTMLResponse(root_page.read())
    root_page.close()
    return response

@app.get("/content/images/{item_name}")
async def get_content(item_name: str, q: str | None = None):
    return responses.FileResponse(config["content_folder"]+"/images/"+item_name)
    

@app.get("/interfaces")
def get_interfaces():
    return json.dumps(sysconf.list_interfaces())

if __name__ == "__main__":
    uvicorn.run("app:app" ,host=config["host"], port=config["port"], reload= True)
    # Trying to connect to DB
    # Checking if db file exist at set location
    if path.exists(config["data_db_location"]):
        data_db = sqlite3.connect(config["data_db_location"])
    else:
    # Creating new file instead of mission one
        open(config["data_db_location"],"w").close()
        data_db = sqlite3.connect(config["data_db_location"])