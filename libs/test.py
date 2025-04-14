from pymodbus.client import ModbusSerialClient
from pymodbus.exceptions import ModbusException
import time


def scan_dcon_devices(
    port="/dev/serial0", baudrates=[9600, 19200, 38400, 57600, 115200]
):
    """Simplified DCON scanner for Raspberry Pi"""
    found_devices = []

    for baudrate in baudrates:
        print(f"\nTrying {baudrate} baud...")

        # Basic client configuration
        client = ModbusSerialClient(
            port=port,
            baudrate=baudrate,
            timeout=0.3,
            parity="N",
            stopbits=1,
            bytesize=8,
            framer="rtu",
        )

        if not client.connect():
            print("  - Connection failed")
            continue

        print(f"  - Connected, scanning addresses 1-247...")

        for addr in range(1, 248):
            try:
                # Try both holding and input registers
                for func_code, desc in [(3, "holding"), (4, "input")]:
                    try:
                        if func_code == 3:
                            response = client.read_holding_registers(0, 1, slave=addr)
                        else:
                            response = client.read_input_registers(0, 1, slave=addr)

                        if not response.isError():
                            found_devices.append(
                                {
                                    "address": addr,
                                    "baudrate": baudrate,
                                    "type": desc,
                                    "value": (
                                        response.registers[0]
                                        if response.registers
                                        else None
                                    ),
                                }
                            )
                            print(
                                f"  - Found device at address {addr} via {desc} registers"
                            )
                            break

                    except ModbusException:
                        continue

            except Exception as e:
                print(f"  - Error at address {addr}: {str(e)}")
                break

        client.close()
        time.sleep(0.1)

    return found_devices


if __name__ == "__main__":
    print("Starting DCON device scan on /dev/serial0...")

    devices = scan_dcon_devices()

    if not devices:
        print("\nNo devices found. Please check:")
        print("1. Serial connection (TX/RX might need to be crossed)")
        print("2. Device power and configuration")
        print("3. Try with 'sudo' if permission issues exist")
    else:
        print("\nDiscovered devices:")
        for i, dev in enumerate(devices, 1):
            print(
                f"{i}. Address: {dev['address']} | Baud: {dev['baudrate']} | "
                f"Type: {dev['type']} | Value: {dev['value']}"
            )
