class ZonesStorage {
    addZone(zone) {
        let zones = localStorage.getItem("zones")

        if (zones !== null) {
            zones = JSON.parse(zones)
        } else {
            zones = []
        }

        zone.id = zones.length
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
        console.log(zones)
        zones.splice(zoneId, 1)
        console.log(zones)

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

        return JSON.parse(zones)
    }
}

export default ZonesStorage
