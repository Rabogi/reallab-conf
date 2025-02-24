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
    return round(int(call_shell("cat /sys/class/thermal/thermal_zone0/temp")) / 1000, 1)


def recreate_default_conf(path):
    conf = {
        "data_db_location": "./data/data.db",
        "host": "localhost",
        "port": 8000,
        "content_folder": "./frontend/content",
        "cert_file": "./ssl/cert.pem",
        "cert_key_file": "./ssl/key.pem",
    }
    open(path, "w").write(json.dumps(conf))


def get_sys_time():
    now = datetime.now()
    return now.strftime("%H:%M:%S")

def get_time_data_ctl():
    data = call_shell("timedatectl")
    data = data.split("\n")
    return {
        "local" : data[0].split(":")[1].split(" ")[2],
        "utc" : data[1].split(":")[1].split(" ")[2],
        "rtc" : data[2].split(":")[1].split(" ")[2],
        "timezone" : data[3].split(":")[1].split(" ")[1],
        "sys_clock_sync" : data[4].split(":")[1].replace(" ",""),
        "ntp" : data[5].split(":")[1].replace(" ",""),
        "rtc_equal_tz" : data[6].split(":")[1].replace(" ",""),
    }