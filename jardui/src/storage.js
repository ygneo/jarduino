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

        return zone.id
    }

    editZone(zoneId, data) {
        let zones = localStorage.getItem("zones")

        zones = JSON.parse(zones)
        zones[zoneId].update(data)

        localStorage.setItem("zones", JSON.stringify(zones))

        return zones[zoneId]
    }

    getZone(zoneId) {
        let zones = localStorage.getItem("zones")

        zones = JSON.parse(zones)
        zones[zoneId].update({"id": zoneId})

        return zones[zoneId]
    }

    getZones() {
        let zones = localStorage.getItem("zones")

        return JSON.parse(zones)
    }
}

export default ZonesStorage
