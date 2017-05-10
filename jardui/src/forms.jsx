import React from 'react'
import ReactDOM from 'react-dom'
import fieldsets from './inputs.js'
import ZonesStorage from './storage.js'


const TextInputFieldSet = fieldsets.TextInputFieldSet
const TimeIntervalFieldSet = fieldsets.TimeIntervalFieldSet


class IrrigationZoneForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            name: '',
            description: '',
            watering_frequence: 0,
            watering_frequence_interval: '',
            watering_time: 0,
            watering_time_interval: ''
        }

        this.storage = new ZonesStorage()

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
    }

    handleCancel(e) {
        this.props.onCancel();
    }

    handleInputChange(event) {
        const target = event.target
        const value = target.type === 'checkbox' ? target.checked : target.value
        const name = target.name

        this.setState({
            [name]: value
        })
    }

    handleSubmit(event) {
        event.preventDefault()

        this.storage.addZone(this.state)

        this.props.onSubmit(event);

    }

    render () {
        return (
            <form onSubmit={this.handleSubmit}>
                <TextInputFieldSet
                    label="Nombre"
                    name="name"
                    id="name"
                    type="text"
                    onChange={this.handleInputChange}
                />
                <TextInputFieldSet
                    label="Descripción"
                    name="description"
                    id="description"
                    type="text"
                    onChange={this.handleInputChange}
                />
                <TimeIntervalFieldSet
                    frequenceLabel="Frecuencia de riego"
                    intervalLabel="Intervalo"
                    id="watering_frequence"
                    name="watering_frequence"
                    onChange={this.handleInputChange}
                />
                <TimeIntervalFieldSet
                    frequenceLabel="Tiempo de riego"
                    intervalLabel="Intervalo"
                    id="watering_time"
                    name="watering_time"
                    onChange={this.handleInputChange}
                />
                <fieldset>
                    <label for="min_soil_moisture">Humedad</label>
                    <select name="min_soil_moisture" id="min_soil_moisture">
                        <option value="very_low">Muy baja</option>
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                        <option value="very_high">Muy alta</option>
                    </select>
                </fieldset>
                <div className="buttons">
                    <button type="button" onClick={this.handleCancel}>CANCELAR</button>
                    <button type="submit">GUARDAR</button>
                </div>
            </form>
        )
    }
}


export default IrrigationZoneForm

