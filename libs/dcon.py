import serial
import time

import libs.sys_conf as sys_conf

allowed_ports = ["serial0","serial1"]

def send_command(port, baudrate, command):
    """
    Send a DCON command and receive the response
    
    :param port: Serial port name (e.g., 'COM3' or '/dev/ttyUSB0')
    :param baudrate: Baud rate (e.g., 9600)
    :param command: DCON command string to send
    :param timeout: Read timeout in seconds
    :return: Received response as string
    """
    try:
        ser = serial.Serial(
            port=port,
            baudrate=baudrate,
            bytesize=serial.EIGHTBITS,
            parity=serial.PARITY_NONE,
            stopbits=serial.STOPBITS_ONE,
            timeout=1
        )
        
        ser.reset_input_buffer()
        ser.reset_output_buffer()
        
        if not command.endswith('\r'):
            command += '\r'
        ser.write(command.encode('ascii'))
        
        time.sleep(0.1)
        
        response = ser.read(ser.in_waiting).decode('ascii').strip()
        
        return response
        
    except serial.SerialException as e:
        print(f"Serial communication error: {e}")
        return None
    finally:
        if 'ser' in locals() and ser.is_open:
            ser.close()

def get_ports():
    return sys_conf.call_shell("ls /dev/ | grep serial").split("\n")

# PORT = '/dev/serial0'
# BAUDRATE = 9600
# COMMAND = "$002\r"
# "cmd": "~00P\r"

def format_command(input : str):
    return "$" + input + "\r"

def find_closest(target, candidates):
    return min(candidates, key=lambda x: abs(x - target))

baudrate_codes = {
    "03":1200,
    "04":2400,
    "05":4800,
    "06":9600,
    "07":19200,
    "08":38400,
    "09":57600,
    "0a":115200,
}

def convert_code(input):
    input = input.lower()
    aa,tt,cc,ff = "","","",""
    chunks = [input[i:i+2] for i in range(0, len(input), 2)]
    aa = chunks[0]
    tt = chunks[1]
    cc = chunks[2]
    ff = chunks[3]
    
    output = {
        "id":int(aa,16),
        "input":tt,
        "baudrate":baudrate_codes[cc],
        "format":ff,
    }
    
    return output

def find_closest_baudrate(input_baudrate):
    baudrate_items = [(code, baud) for code, baud in baudrate_codes.items()]
    closest = min(baudrate_items, key=lambda item: abs(item[1] - input_baudrate))
    
    return closest[0]

def build_config(config : dict,aa):
    prefix = "%"
    nn = config["id"]
    tt = config["input"]
    cc = config["baudrate"]
    ff = config["format"]
    
    return prefix + aa + nn + tt + cc + ff + "\r" 