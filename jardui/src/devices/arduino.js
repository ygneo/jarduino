import pythonShell from 'python-shell'
import fs from 'fs'
import moistureLevel2MoistureValue from '../sensors/soil_moisture_sensor.js'


const SKETCH_DIR = 'sketches/jarduino_over_opengarden/'



class ArduinoDevice {
    constructor(handlers) {
        this.detect = this.detect.bind(this)
        this.upload = this.upload.bind(this)
        this.update_code_config = this.update_code_config.bind(this)
        this.upload_code = this.upload_code.bind(this)
        this.try_to_upload_code = this.try_to_upload_code.bind(this)
    }

    detect(handlers) {
        let this_instance = this;

        this.pyshell = new pythonShell('jarduino.py', {"args": ["detect"]})

        this.pyshell.on('message', function (deviceName) {
            this_instance.name = deviceName
            handlers.onDetected(this_instance)
        })

        this.pyshell.on('error', function (message) {
            handlers.onError(message)
        })
    }

    upload(zones, handlers) {
        this.update_code_config(zones)
        this.upload_code(handlers)
    }

    update_code_config(zones) {
        let moistureValues = []
        let wateringTimes = []

        zones.map((zone,i) => {
            moistureValues.push(moistureLevel2MoistureValue(zone.min_soil_moisture))
            wateringTimes.push(wateringTimeToMs(zone.watering_time, zone.watering_time_interval))
        })

        var codeConfig = {
            "soilMoistureMinSensorValues": moistureValues,
            "checkingDelay": 1000,
            "numchecksBeforeWatering": 3,
            "wateringTimes": wateringTimes
        }
        var json = JSON.stringify(codeConfig)
        fs.writeFile(SKETCH_DIR + '/jarduino.json', json, 'utf8')
    }

    upload_code(handlers) {
        this.try_to_upload_code(handlers)
    }

    try_to_upload_code(handlers) {
        this.pyshell = new pythonShell('jarduino.py', {"args": ["upload"]});

        this.pyshell.on('message', function (message) {
            console.log(message);
        });

        this.pyshell.end(function (err) {
            if (!err.toString().includes("never used")) {
                 console.log(err);
                 handlers.onUploadError()
             } else {
                 handlers.onUploaded()
             }
        });
    }

}


function wateringTimeToMs(time, interval) {
    let multiplier = {
        "s": 1000,
        "m": 60000,
        "h": 360000
    }
    return time * multiplier[interval];
}


export default ArduinoDevice
