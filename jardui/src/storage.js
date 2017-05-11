class ZonesStorage {
    addZone(zone) {
        let zones = localStorage.getItem("zones")

        if (zones !== null) {
            zones = JSON.parse(zones)
        } else {
            zones = []
        }

        zones.push(zone)

        localStorage.setItem("zones", JSON.stringify(zones))

        return zones.length - 1
    }

    getZone(zoneId) {
        let zones = localStorage.getItem("zones")

        console.log(zoneId)
        zones = JSON.parse(zones)
        console.log(zones)
        console.log(zones[zoneId])

        return zones[zoneId]
    }

    getZones() {
        let zones = localStorage.getItem("zones")

        return JSON.parse(zones)
    }
}

export default ZonesStorage
