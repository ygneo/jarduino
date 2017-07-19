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
from optparse import OptionParser


SENSOR_TYPES = ["soilMoisture", "airTemperature", "airHumidity"]


class JarduinoParser(object):

    def __init__(self, serial_device, fake_serial_input=False, debug=False):
        self.fake_serial_input = fake_serial_input

        self.serial = serial_device

        timestamp_pattern = "^#time#([0-9]+)#"
        sensors_pattern = "#sensors#([0-9]/.+)#([0-9]/.+)#"
        actuators_pattern = "#actuators#([0-9],\d+)?#?([0-9],\d+)?#?$"
        self.data_pattern = re.compile("{}{}{}".format(
            timestamp_pattern, sensors_pattern, actuators_pattern))

        self.debug = debug

    def read_serial_data(self):
        if self.fake_serial_input:
            return fake_serial_read(self.serial)
        return self.serial.readline()

    def parse(self):
        try:
            sensors_data = []
            actuators_data = []

            data = self.read_serial_data().strip()

            if self.debug:
                print data
            data_match = self.data_pattern.match(data)

            if data_match:
                matches = data_match.groups()
                timestamp = matches[0]
                sensors_matches = matches[1:3] 
                actuators_matches = matches[3:]

                sensors_data = self.sensors_parsed_data(sensors_matches)
                actuators_data = self.actuators_parsed_data(actuators_matches)

            if sensors_data or actuators_data:
                return {
                    "timestamp": str(timestamp),
                    "sensorsData": sensors_data,
                    "actuatorsData": actuators_data
                }

        except serial.SerialException:
            pass

    def sensors_parsed_data(self, sensors_data):
        data = []

        for sensor_data in sensors_data:
            zone_id, sensor_tuples = sensor_data.split("/")
            zone_id = int(zone_id)
            sensor_tuples = json.loads(sensor_tuples)

            data_from_sensors = []
            for sensor_tuple in sensor_tuples:
                sensor_type_id, value = sensor_tuple
                data_from_sensors.append({
                    "type": SENSOR_TYPES[sensor_type_id],
                    "value": value
                })

            data.append({
                "zoneId": zone_id,
                "data": data_from_sensors
            })

        return data

    def actuators_parsed_data(self, actuators_data):
        data = []

        for actuator_data in actuators_data:
            try:
                zone_id, value = actuator_data.split(",")
            except AttributeError:
                continue
            data.append({
                "zoneId": zone_id,
                "data": [{
                    "type": "irrigation",
                    "value": value,
                }]
            })

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


def print_parsed_serial_input(debug=False, fake_serial_input=False):
    serial_input, serial_output, serial_name = arduino_devices(fake_serial_input).values()
    parser = JarduinoParser(serial_input, fake_serial_input, debug)

    def signal_term_handler(signal, frame):
        serial_input.close()
        sys.stdout.flush()
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


def upload(sketch_dir):
    device_name = arduino_devices()["device_name"]
    call("cd {}; MONITOR_PORT={} make".format(sketch_dir, device_name), shell=True)
    call("cd {}; MONITOR_PORT={} make upload".format(sketch_dir, device_name), shell=True)


def _read_date_times(date_times):
    date_times_string = "{"

    for i, date_time in enumerate(date_times):
        date_times_string += "DateTime({year},{month},{day},{hour},{min})".format(**date_time)
        if i != (len(date_times) - 1):
            date_times_string += ", "

    date_times_string += "}"

    return date_times_string


def _read_in_outs(values):
    parsed_values = []
    for value in values:
        value = str(value)
        if value[0] == "9":
            value = int(value)
        parsed_values.append(value)
    parsed_values = str(parsed_values).replace("[", "{").replace("]", "}")
    parsed_values = str(parsed_values).replace("'", "")
    return parsed_values

def parse_code_configuration(sketch_dir):
    with open("{}jarduino.json".format(sketch_dir), "r") as f:
        code_configuration = json.loads(f.read())

    for key, value in code_configuration.iteritems():
        if key == "irrigatingStartDateTimes":
            code_configuration[key] = _read_date_times(value)
        elif key in ("sensorsIns", "electroOuts"):
            code_configuration[key] = _read_in_outs(value)
        else:
            code_configuration[key] = str(code_configuration[key]).replace("[", "{").replace("]", "}")

    return code_configuration


def generate(sketch_dir):
    code_configuration = parse_code_configuration(sketch_dir)

    with open("{}jarduino.tpl".format(sketch_dir), "r") as f:
        template = Template(f.read())

    with open("{}jarduino.ino".format(sketch_dir), "w") as f:
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


parser = OptionParser()
parser.add_option("-d", "--debug",
                  dest="debug_mode",
                  help="Activate debug mode",
                  action="store_true",
                  default=False)

(options, args) = parser.parse_args()

try:
    mode = args[0]
except IndexError:
    mode = "read"

try:
    sketch_dir = args[1]
except IndexError:
    sketch_dir = "./sketches/jarduino_over_opengarden/"

if mode == "read":
    print_parsed_serial_input(debug=options.debug_mode)
if mode == "readfake":
    print_parsed_serial_input()
if mode == "detect":
    detect_arduino()
if mode == "upload":
    generate(sketch_dir)
    upload(sketch_dir)
