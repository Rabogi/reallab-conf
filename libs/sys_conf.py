import subprocess
import json
from datetime import datetime


def call_shell(command):
    response = subprocess.getoutput(command)
    return response


def list_interfaces():
    data = call_shell("ip --brief address show").split("\n")
    interfaces = {}
    for i in data:
        t = i.split()
        if len(t) > 2:
            interfaces[t[0]] = t[2]
        else:
            interfaces[t[0]] = "None"
    return interfaces

def get_temp():
    return round(int(call_shell("cat /sys/class/thermal/thermal_zone0/temp"))/1000,1)

def recreate_default_conf(path):
    conf = {
        "data_db_location": "./data/data.db",
        "host": "localhost",
        "port": 8000,
        "content_folder": "./frontend/content",
    }
    open(path, "w").write(json.dumps(conf))


def get_sys_time():
    now = datetime.now()
    return now.strftime("%H:%M:%S")