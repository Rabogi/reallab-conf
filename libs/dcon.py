from pymodbus.client import ModbusSerialClient
from serial.tools.list_ports import comports

def list_ports():
    return [port.device for port in comports()]