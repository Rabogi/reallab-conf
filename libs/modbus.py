import serial
import time

import libs.sys_conf as sys_conf

def get_ports():
    devices = []
    devices += sys_conf.call_shell("ls /dev | grep ttyA").split("\n")
    devices += sys_conf.call_shell("ls /dev | grep ttyS").split("\n")
    return devices


def send_command(port, baudrate, command):
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
        
        ser.write(command.encode('ascii'))
        
        time.sleep(0.2)
        
        response = ser.read(ser.in_waiting).decode('ascii').strip()
        
        return response
        
    except serial.SerialException as e:
        print(f"Serial communication error: {e}")
        return None
    finally:
        if 'ser' in locals() and ser.is_open:
            ser.close()