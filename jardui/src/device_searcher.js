import ArduinoDevice from './devices/arduino.js'


const DEVICE_POLLING_INTERVAL = 2000

let instance = null;


class DeviceSearcher {
    constructor() {
        if(!instance){
            instance = this;
        }

        this.device = new ArduinoDevice

        this.startSearch = this.startSearch.bind(this)
        this.searchDevice = this.searchDevice.bind(this)
        this.stopSearch = this.stopSearch.bind(this)

        return instance;
    }

    startSearch(handlers) {
        let searchDevice = this.searchDevice

        searchDevice(handlers)

        this.interval = setInterval(function () {
            searchDevice(handlers)
        }, DEVICE_POLLING_INTERVAL)
    }

    searchDevice(handlers) {
        this.device.detect(handlers)
    }

    stopSearch(handlers) {
        clearInterval(this.interval)
    }


}


export default DeviceSearcher

