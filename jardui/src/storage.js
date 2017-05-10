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
    }
}

export default ZonesStorage
