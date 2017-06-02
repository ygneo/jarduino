import React from 'react'
import ReactDOM from 'react-dom'


class SoilMoistureLevel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            "level": 0,
            "value": 0
        }

        this.max_level = 10

        this.convertMoistureValue2Level = this.convertMoistureValue2Level.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            "value": nextProps.value,
            "level": this.convertMoistureValue2Level(nextProps.value)
        })
    }

    convertMoistureValue2Level(value, max_value=1023) {
        return Math.round((this.max_level * value) / max_value);
    }

    render () {
        let className = "level level" + this.state.level

        return (
            <div className="soil_moisture_level">
                <div className={className}></div>
            </div>
        )
    }
}

export default SoilMoistureLevel
