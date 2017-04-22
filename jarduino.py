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
        self.value_pattern = re.compile("^#([0-9])#([0-9]+|w)#$")

    def read_serial_data(self):
        if self.fake_serial_input:
            return fake_serial_read(self.serial)
        return self.serial.readline()

    def parse(self):
        try:
            data = self.read_serial_data()
            match = self.value_pattern.match(data.strip())
            if match:
                values = match.groups()
                return '["{}","{}"]'.format(str(values[0]), str(values[1]))
            return None
        except serial.SerialException:
            pass


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
                print output
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


def arduino_devices(fake_serial_input):
    device_names = arduino_device_names()

    if not device_names and not fake_serial_input:
        raise IOError("No Arduino found")

    if len(device_names) > 1:
        warnings.warn('Multiple Arduinos found - using the first.')

    devices = serial_devices(device_names, fake_serial_input)
#    print "[x] Arduino found in {}".format(devices["device_name"])
#    if FAKE_SERIAL:
#        print " !! THIS SERIAL DEVICE IS FAKED !!"
#    print "\n"

    return devices


try:
    mode = sys.argv[1]
except IndexError:
    mode = "read"


if mode == "read":
    print_parsed_serial_input()
if mode == "readfake":
    print_parsed_serial_input(fake_serial_input=True)
if mode == "upload":
    generate()
    upload()
