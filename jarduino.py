import os
import re
import json
import sys
import warnings
import serial
import pty
import time
import signal
import serial.tools.list_ports
from string import Template
from subprocess import call
from random import randint


SKETCKES_DIR = "./sketches/jarduino/"



class JarduinoParser(object):

    def __init__(self, serial_device, fake_serial_input=False):
        self.fake_serial_input = fake_serial_input
        self.serial = serial_device
        self.sensors_values_pattern = re.compile("^#sensors#([0-9],[0-9]+)#([0-9],[0-9]+)#$")
        self.actuators_values_pattern = re.compile("^#actuators#([0-9],w)#$")
        self.sensors_data = []

    def read_serial_data(self):
        if self.fake_serial_input:
            return fake_serial_read(self.serial)
        return self.serial.readline()

    def parse(self):
        try:
            data = self.read_serial_data().strip()
            sensors_match = self.sensors_values_pattern.match(data)
            actuators_match = self.actuators_values_pattern.match(data)

            if sensors_match:
                return self.sensors_parsed_data(sensors_match.groups())

            if actuators_match:
                return self.actuators_parsed_data(actuators_match.groups())

            return None
        except serial.SerialException:
            pass

    def sensors_parsed_data(self, sensors_data):
        data = {
            "timestamp": str(time.time()),
            "type": "sensors",
            "sensorsData": []
        }

        for sensor_data in sensors_data:
            id, value = sensor_data.split(",")
            data["sensorsData"].append({
                "id": id,
                "type": "soil_moisture",
                "value": value,
            })

        return data

    def actuators_parsed_data(self, actuators_data):
        id, _ = actuators_data[0].split(",")

        data = {
            "timestamp": str(time.time()),
            "type": "actuators",
            "actuatorsData": [
                {
                    "id": id,
                    "type": "irrigation",
                }
            ]
        }

        return data


def serial_devices(arduino_device_names=[], fake_serial_input=False):
    if arduino_device_names:
        device_name = arduino_device_names[0]
        serial_input = serial.Serial(device_name, 9600, timeout=2)
        serial_output = None

    if fake_serial_input:
        master, slave = pty.openpty()
        serial_input = master
        device_name = os.ttyname(slave)
        serial_output = serial.Serial(device_name)

    return {"serial_input": serial_input,
            "device_name": device_name,
            "serial_output": serial_output}


def fake_serial_read(serial):
    return os.read(serial, 9)


def fake_arduino_output(serial_output, n=2):
    for i in range(n):
        value = str(randint(0, 1024)).zfill(4)
        serial_output.write('#{}#{}#\n'.format(i, value))
        serial_output.write('#{}#w#\n'.format(i, value))


def print_parsed_serial_input(fake_serial_input=False):
    serial_input, serial_output, serial_name = arduino_devices(fake_serial_input).values()
    parser = JarduinoParser(serial_input, fake_serial_input)

    def signal_term_handler(signal, frame):
        serial_input.close()
        sys.exit(0)

    signal.signal(signal.SIGTERM, signal_term_handler)

    while 1:
        try:
            if fake_serial_input:
                fake_arduino_output(serial_output)
            output = parser.parse()
            if output:
                print json.dumps(output)
            sys.stdout.flush()
            time.sleep(1)
        except KeyboardInterrupt:
            serial_input.close()
            exit(1)


def upload():
    device_name = arduino_devices()["device_name"]
    call("cd {}; MONITOR_PORT={} make".format(SKETCKES_DIR, device_name), shell=True)
    call("cd {}; MONITOR_PORT={} make upload".format(SKETCKES_DIR, device_name), shell=True)


def read_code_configuration():
    with open("{}jarduino.json".format(SKETCKES_DIR), "r") as f:
        code_configuration = json.loads(f.read())

    for key, value in code_configuration.iteritems():
        code_configuration[key] = str(code_configuration[key]).replace("[", "{").replace("]", "}")

    return code_configuration


def generate():
    code_configuration = read_code_configuration()

    with open("{}jarduino.tpl".format(SKETCKES_DIR), "r") as f:
        template = Template(f.read())

    with open("{}jarduino.ino".format(SKETCKES_DIR), "w") as f:
        f.write(template.substitute(**code_configuration))


def arduino_device_names():
    device_names = []
    for port in serial.tools.list_ports.comports():
        is_arduino_device = 'Arduino' in port.description or \
                            'Arduino' in port.manufacturer
        if is_arduino_device:
            device_names.append(port.device)

    return device_names


def arduino_devices(fake_serial_input=False):
    device_names = arduino_device_names()

    if not device_names and not fake_serial_input:
        raise IOError("No Arduino found")

    if len(device_names) > 1:
        warnings.warn('Multiple Arduinos found - using the first.')

    return serial_devices(device_names, fake_serial_input)


def detect_arduino():
    try:
        devices = arduino_devices()
    except IOError:
        exit(1)
    device_name = devices["device_name"]
    print device_name


try:
    mode = sys.argv[1]
except IndexError:
    mode = "read"


if mode == "read":
    print_parsed_serial_input()
if mode == "readfake":
    print_parsed_serial_input()
if mode == "detect":
    detect_arduino()
if mode == "upload":
    generate()
    upload()
