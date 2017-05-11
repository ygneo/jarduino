import React from 'react'
import ReactDOM from 'react-dom'
import fieldsets from './inputs.js'
import ZonesStorage from './storage.js'


const TextInputFieldSet = fieldsets.TextInputFieldSet
const TimeIntervalFieldSet = fieldsets.TimeIntervalFieldSet


class DeleteButton extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            'mode': props.mode,
            'zoneId': props.zoneId
        }

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick(event) {
        this.props.onClick(event.target.getAttribute('data-zoneId'));
    }

    render() {
        if (this.state.mode == "on") {
            return (
                <span className="delete"
                  data-zoneId={this.state.zoneId}
                      onClick={this.handleClick}/>
            )
        }
        return null
    }
}


class IrrigationZoneForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            'zone': {
                name: '',
                description: '',
                watering_frequence: 0,
                watering_frequence_interval: '',
                watering_time: 0,
                watering_time_interval: ''
            }
        }

        if (props.zone) {
            this.state.zone = props.zone
        }

        this.storage = new ZonesStorage()

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleDelete = this.handleDelete.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
    }

    handleCancel(e) {
        this.props.onCancel();
    }

    handleInputChange(event) {
        const target = event.target
        const value = target.type === 'checkbox' ? target.checked : target.value
        const name = target.name
        let zone

        zone = this.state.zone
        zone[name] = value

        this.setState({
            'zone': zone
        })
    }

    handleDelete(zoneId) {
        var r = confirm("Se borrará la zona. ¿De acuerdo?")

        if (r == true) {
            this.storage.deleteZone(zoneId)
        }

        this.props.onDelete()
    }

    handleSubmit(event) {
        let zone

        event.preventDefault()

        if (this.state.zone.id === undefined) {
            zone = this.storage.addZone(this.state.zone)
            this.props.onZoneCreated(zone);
        } else {
            zone = this.storage.editZone(this.state.zone.id, this.state.zone)
            this.props.onZoneUpdated(zone);
        }
    }

    render () {
        let zone = this.state.zone
        let deleteButtonMode = "off"
        let zoneId

        if (zone.id !== undefined) {
            deleteButtonMode = "on"
            zoneId = zone.id
        }

        return (
            <form onSubmit={this.handleSubmit}>
                <TextInputFieldSet
                    label="Nombre"
                    name="name"
                    id="name"
                    type="text"
                    value={zone.name}
                    onChange={this.handleInputChange}
                />
                <TextInputFieldSet
                    label="Descripción"
                    name="description"
                    id="description"
                    type="text"
                    value={zone.description}
                    onChange={this.handleInputChange}
                />
                <TimeIntervalFieldSet
                    frequenceLabel="Frecuencia de riego"
                    intervalLabel="Intervalo"
                    id="watering_frequence"
                    name="watering_frequence"
                    frequenceValue={zone.watering_frequence}
                    intervalValue={zone.watering_frequence_interval}
                    onChange={this.handleInputChange}
                />
                <TimeIntervalFieldSet
                    frequenceLabel="Tiempo de riego"
                    intervalLabel="Intervalo"
                    id="watering_time"
                    name="watering_time"
                    frequenceValue={zone.watering_time}
                    intervalValue={zone.watering_time_interval}
                    onChange={this.handleInputChange}
                />
                <fieldset>
                    <label for="min_soil_moisture">Umbral de humedad</label>
                    <select name="min_soil_moisture" id="min_soil_moisture"
                            value={zone.min_soil_moisture}
                            onChange={this.handleInputChange}
                    >
                        <option value="very_low">Muy baja</option>
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                        <option value="very_high">Muy alta</option>
                    </select>
                </fieldset>
                <div className="buttons">
                    <DeleteButton mode={deleteButtonMode}
                                  zoneId={zoneId}
                                  onClick={this.handleDelete}
                    />
                    <div className="actions">
                        <button type="button" onClick={this.handleCancel}>CANCELAR</button>
                        <button type="submit">GUARDAR</button>
                    </div>
                </div>
            </form>
        )
    }
}


export default IrrigationZoneForm

