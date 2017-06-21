import timeConverter from './timeConverter.js'


export default function parseData(data) {
    data["localDateTime"] = timeConverter(data.timestamp)
    return data
}
