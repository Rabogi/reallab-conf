import serial
import time

import libs.sys_conf as sys_conf

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

def format_command(input : str):
    return "$" + input + "\r"