function parseZonesData(data) {
    data = JSON.parse(data)

    if (data.type == "sensors") {
        return data
    } else if (data.type == "actuators") {
//        return parseZoneSensorsData(data.sensorsData)
    }
}


export default parseZonesData
