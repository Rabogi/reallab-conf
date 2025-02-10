import subprocess

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