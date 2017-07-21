import React from 'react'
import ReactDOM from 'react-dom'
import moistureLevel2MoistureValue from '../sensors/soil_moisture_sensor.js'


const MAXLEVEL = 10
const MAXVALUE = 100

// TODO we can drop this

function convertMinSoilMoisture2Level(value) {
    let moisture_value = moistureLevel2MoistureValue(value)

    return convertMoistureValue2Level(moisture_value)
}


function convertMoistureValue2Level(value) {
    return Math.round((MAXLEVEL * value) / MAXVALUE)
}


class SoilMoistureLevel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            time: props.time,
            value: props.value,
            level: convertMoistureValue2Level(props.value),
            mark: convertMinSoilMoisture2Level(props.zone.threshold.soilMoisture)
        }
    }

    componentWillReceiveProps(nextProps) {
        let level = convertMoistureValue2Level(nextProps.value)
        let mark = convertMinSoilMoisture2Level(nextProps.zone.soilMoisture)

        this.setState({
            value: nextProps.value,
            mark: mark,
            level: level,
            time: nextProps.time
        })
    }

    render () {
        let levelClassName = "level level"+ this.state.level
        let markClassName = "mark mark" + this.state.mark
        let title = "Ult. lectura " + this.state.time + " | Valor  " + this.state.value


        return (
            <div className="soil_moisture_level" title={title}>
                <hr className={markClassName} />
                <div className={levelClassName}>
                </div>
            </div>
        )
    }
}

export default SoilMoistureLevel
