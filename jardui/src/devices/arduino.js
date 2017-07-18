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
        let upload_code = this.upload_code

        this.update_code_config(zones, function () { upload_code(handlers) })
    }

    update_code_config(zones, callback) {
        let moistureValues = []
        let wateringTimes = []
        let irrigatingStartDateTimes = []
        let irrigatingFrequences = []
        let numZones = zones.length

        zones.map((zone,i) => {
            moistureValues.push(
                parseInt(zone.min_soil_moisture)
            )

            wateringTimes.push(
                timeIntervalToMs(zone.watering_time, zone.watering_time_interval)
            )

            let datetime = new Date(zone.irrigatingStart)
            irrigatingStartDateTimes.push({
                year: datetime.getFullYear(),
                month: datetime.getMonth(),
                day: datetime.getDate(),
                hour: datetime.getHours(),
                min: datetime.getMinutes()
            })

            irrigatingFrequences.push(
                timeIntervalToSecs(zone.watering_frequence, zone.watering_frequence_interval)
            )
        })

        let settings = JSON.parse(localStorage.getItem("settings"))

        let checkingDelay = timeIntervalToMs(
            settings.sendingFrequence,
            settings.sendingInterval)

        let codeConfig = {
            "numZones": numZones,
            "codeTemplatePath": settings.codeTemplatePath,
            "soilMoistureMinSensorValues": moistureValues,
            "checkingDelay": checkingDelay,
            "numChecksBeforeSending": settings.readingsCount,
            "wateringTimes": wateringTimes,
            "irrigatingStartDateTimes": irrigatingStartDateTimes,
            "irrigatingFrequences": irrigatingFrequences
        }

        let json = JSON.stringify(codeConfig)

        fs.writeFile(SKETCH_DIR + '/jarduino.json', json, callback)
    }

    upload_code(handlers) {
        this.try_to_upload_code(handlers)
    }

    try_to_upload_code(handlers) {
        let settings = JSON.parse(localStorage.getItem("settings"))
        let codeTemplatePath = settings.codeTemplatePath.trim()

        let options = {
            mode: 'text',
            args: ['upload',
                  codeTemplatePath]
        }

        this.pyshell = new pythonShell('jarduino.py', options)

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


function timeIntervalToMs(time, interval) {
    let multiplier = {
        "s": 1000,
        "m": 60000,
        "h": 360000
    }
    return time * multiplier[interval];
}

function timeIntervalToSecs(time, interval) {
    let multiplier = {
        "s": 1,
        "m": 60,
        "h": 3600
    }
    return time * multiplier[interval];
}


export default ArduinoDevice
