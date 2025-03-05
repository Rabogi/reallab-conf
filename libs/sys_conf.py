import subprocess
import json
import os
from datetime import datetime

def get_pid():
    return os.getpid()

def get_server_mem():
    return [get_pid(),round(int(call_shell("ps -o rss= -p " + str(get_pid())))/1024,2)]

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
        "host": "auto",
        "port": 8000,
        "content_folder": "./frontend/content",
        "cert_file": "./ssl/cert.pem",
        "cert_key_file": "./ssl/key.pem",
        "session_lifetime": 30,
    }
    open(path, "w").write(json.dumps(conf))


def get_sys_time():
    now = datetime.now()
    return now.strftime("%H:%M:%S")

def get_time_data_ctl():
    data = call_shell("timedatectl")
    data = data.split("\n")
    for i in range(len(data)):
        data[i] = data[i].strip()
    output = {
        "date" : data[0].split(" ")[3],
        "day" : data[0].split(" ")[3].split("-")[2],
        "month" : data[0].split(" ")[3].split("-")[1],
        "year" : data[0].split(" ")[3].split("-")[0],
        "local" : data[0].split(" ")[4],
        "utc" : data[1].split(" ")[4],
        "rtc" : data[2].split(" ")[4],
        "timezone" : data[3].split(":")[1].split(" ")[1],
        "sys_clock_sync" : data[4].split(":")[1].replace(" ",""),
        "ntp" : data[5].split(":")[1].replace(" ",""),
        "rtc_equal_tz" : data[6].split(":")[1].replace(" ",""),
    }
    if output["sys_clock_sync"] == "yes":
        output["sys_clock_sync"] = True
    else:
        output["sys_clock_sync"] = False
    if output["rtc_equal_tz"] == "yes":
        output["rtc_equal_tz"] = True
    else:
        output["rtc_equal_tz"] = False
    return output
    
def get_memory():
    data = call_shell("free -m | grep Mem:")
    data = ' '.join(data.split()).split(" ")
    data = {
        "total":data[1],
        "used":data[2],
        "free":data[3],
        "shared":data[4],
        "buff/cache":data[5],
        "available":data[6],
    }
    return data

def get_load():
    data = call_shell("cat /proc/loadavg")
    data = data.split(" ")
    return {
        "load1":data[0],
        "load5":data[1],
        "load15":data[2],
        "procs":data[3],
        "active_procs":data[3].split("/")[0],
        "all_procs":data[3],
    }
    
def get_temps():
    data = call_shell("cat /sys/class/thermal/thermal_zone0/temp")
    return {
        "temp" : round(int(data)/1000,1)
    }