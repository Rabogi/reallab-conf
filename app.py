from fastapi import FastAPI
import uvicorn
import sqlite3
import json
from os import path

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

# @app.get("/status"):
# def read_status:
#     return {"conn status": conn.}

if __name__ == "__main__":
    config = json.loads(open("./config.json",).read())
    
    uvicorn.run("app:app" ,host=config["host"], port=config["port"], reload= True)
    # Trying to connect to DB
    # Checking if db file exist at set location
    if path.exists(config["data_db_location"]):
        data_db = sqlite3.connect(config["data_db_location"])
    else:
    # Creating new file instead of mission one
        open(config["data_db_location"],"w").close()
        data_db = sqlite3.connect(config["data_db_location"])