

function getForZoneId(zoneId, data) {
    let item = {}

    if (data) {
        data.map((dataItem, i) => {
            if (dataItem.zoneId == zoneId) {
                item = dataItem.data;
            }
        })
    }


    return item;
}


class ZonesStorage {

    parsedData(id, data) {
        let sensorsData = getForZoneId(id, data.sensorsData)
        let actuatorsData = getForZoneId(id, data.actuatorsData)
        let sensorsDataPerType = {}

        let sensorTypes = ["soilMoisture", "airTemperature", "airHumidity"]
        for (let i in sensorTypes) {
            let sensorType = sensorTypes[i]

            let sensorData = sensorsData.find(function (sensorData) {
                return sensorData.type === sensorTypes[i]
            })

            sensorsDataPerType[sensorType] = sensorData.value
        }

        return {
            timestamp: data.timestamp,
            sensorsData: sensorsDataPerType,
            actuatorsData: actuatorsData
        }
    }

    addZonesData(data) {
        let zones = localStorage.getItem("zones")

        zones = JSON.parse(zones)

        for (let id in zones) {
            zones[id].data.push(this.parsedData(id, data))
        }

        localStorage.setItem("zones", JSON.stringify(zones))
    }

    getZoneData(id) {
        let zones = localStorage.getItem("zones")

        zones = JSON.parse(zones)

        return zones[id].data
    }

    addZone(zone) {
        let zones = localStorage.getItem("zones")

        if (zones) {
            zones = JSON.parse(zones)
        } else {
            zones = []
        }

        if (zones && zones.length) {
            zone.id = zones.length
        } else {
            zone.id = 0
        }
        zone.data = []
        zones.push(zone)

        localStorage.setItem("zones", JSON.stringify(zones))

        return zone
    }

    editZone(zoneId, data) {
        let zones = localStorage.getItem("zones")

        zones = JSON.parse(zones)
        Object.assign(zones[zoneId], data)

        localStorage.setItem("zones", JSON.stringify(zones))

        return zones[zoneId]
    }

    deleteZone(zoneId) {
        let zones = localStorage.getItem("zones")

        zones = JSON.parse(zones)
        zones.splice(zoneId, 1)

        localStorage.setItem("zones", JSON.stringify(zones))

        return true
    }

    getZone(zoneId) {
        let zones = localStorage.getItem("zones")

        zones = JSON.parse(zones)

        return zones[zoneId]
    }

    getZones() {
        let zones = localStorage.getItem("zones")

        zones = JSON.parse(zones)

        if (zones && zones.length) {
            return Object.keys(zones).map(x => zones[x])
        } 
        return null
    }
}

export default ZonesStorage
