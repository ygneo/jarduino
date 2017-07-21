import React from 'react'
import ReactDOM from 'react-dom'
import fieldsets from './inputs.js'
import ZonesStorage from './storage.js'
import ReactWidgets from 'react-widgets'
import timeConverter from './timeConverter.js'
import dateFormat from 'dateformat'


const TextInputFieldSet = fieldsets.TextInputFieldSet
const TimeIntervalFieldSet = fieldsets.TimeIntervalFieldSet
const ThresholdFieldSet = fieldsets.ThresholdFieldSet

const DateTimePicker = ReactWidgets.DateTimePicker;


function zeroPadding(n, digits=2) {
    return ('00'+n).slice(-digits);
}


var localizer = {

    formats: {
        default: "DEFAULT",
        date: 'd',
        time: 'HH:MM',
        header:  'mmm yyyy',
        footer: "FOOTER",
        day: 'd',
        dayOfMonth: 'd',
        month: 'm',
        year: 'y',
        decade: "y - y",
        century: "y - y"
    },

    firstOfWeek() {
        return 0
    },

    parse(value, format, cultureStr){
        return new Date(value)
    },

    format(value, format, cultureStr){
        let dayOfWeek = ['Lun','Mar','Mie','Jue','Vie', 'Sáb', 'Dom']
        let months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

        let year = value.getFullYear();
        let month = months[value.getMonth()];
        let day = dayOfWeek[value.getDay()]
        let date = value.getDate();
        let hour = value.getHours();
        let min = zeroPadding(value.getMinutes());
        let time


        if (!format) {
            return day
        } else {
            if (format === "DEFAULT" || format === "FOOTER") {
                let day = dayOfWeek[value.getDay() - 1]
                return date + ' ' + month + ' ' + year + ' ' + hour + ':' + min;
            } else {
                return dateFormat(value, format)
            }
        }
    }
}

ReactWidgets.setDateLocalizer(localizer)


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


const defaultThresholdValues = {
    "soilMoisture": "50",
    "airHumidity": "50",
    "airTemperature": "30"
}

class IrrigationZoneForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            'zone': {
                name: '',
                description: '',
                watering_frequence: 0,
                watering_frequence_interval: 'h',
                watering_time: 0,
                watering_time_interval: 'm',
                irrigatingStart: new Date(),
                thresholds: {
                    soilMoisture: {
                        enabled: true,
                        value: defaultThresholdValues.soilMoisture,
                        abrName: "h"
                    },
                    airTemperature: {
                        enabled: false,
                        value: defaultThresholdValues.airTemperature,
                        abrName: "t"
                    },
                    airHumidity: {
                        enabled: false,
                        value: defaultThresholdValues.airHumidity,
                        abrName: "hr"
                    }
                }
            }
        }

        if (props.zone) {
            Object.assign(this.state.zone, props.zone);
        }

        this.storage = new ZonesStorage()

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleIrrigatingStartChange = this.handleIrrigatingStartChange.bind(this)

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

        if (name.startsWith("th_")) {
            zone.thresholds[name.split("_")[1]].value = value
        } else if (name.startsWith("cb_th_")) {
            zone.thresholds[name.split("_")[2]].enabled = value
        }
        else {
            zone[name] = value
        }

        this.setState({
            'zone': zone
        })
    }

    handleIrrigatingStartChange(date) {
        let zone = this.state.zone

        zone["irrigatingStart"] = date

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
        let irrigatingStart = new Date(this.state.zone.irrigatingStart)

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
                <h4>Riego programado</h4>
                <label>Inicio</label>
                <DateTimePicker
                    defaultValue={irrigatingStart}
                    onChange={this.handleIrrigatingStartChange}
                    step={5}
                />
                <TimeIntervalFieldSet
                    frequenceLabel="Frecuencia"
                    intervalLabel="Intervalo"
                    id="watering_frequence"
                    name="watering_frequence"
                    frequenceValue={zone.watering_frequence}
                    intervalValue={zone.watering_frequence_interval}
                    onChange={this.handleInputChange}
                />
                <TimeIntervalFieldSet
                    frequenceLabel="Duración"
                    intervalLabel="Intervalo"
                    id="watering_time"
                    name="watering_time"
                    frequenceValue={zone.watering_time}
                    intervalValue={zone.watering_time_interval}
                    onChange={this.handleInputChange}
                />
                <h4>Umbrales de riego</h4>
                <ThresholdFieldSet
                    label="Humedad del sustrato"
                    name="th_soilMoisture"
                    id="thSoilMoisture"
                    value={zone.thresholds.soilMoisture.value}
                    rangeMin={1}
                    rangeMin={100}
                    step={1}
                    defaultValue={defaultThresholdValues.soilMoisture}
                    units="%"
                    enabled={zone.thresholds.soilMoisture.enabled}
                    onChange={this.handleInputChange}
                />
                <ThresholdFieldSet
                    label="Humedad del aire"
                    name="th_airHumidity"
                    id="thAirHumidity"
                    value={zone.thresholds.airHumidity.value}
                    rangeMin={1}
                    rangeMin={100}
                    step={1}
                    defaultValue={defaultThresholdValues.airHumidity}
                    units="%"
                    enabled={zone.thresholds.airHumidity.enabled}
                    onChange={this.handleInputChange}
                />
                <ThresholdFieldSet
                    label="Temperatura del aire"
                    name="th_airTemperature"
                    id="th_airTemperature"
                    value={zone.thresholds.airTemperature.value}
                    rangeMin={1}
                    rangeMin={50}
                    step={1}
                    defaultValue={defaultThresholdValues.airTemperature}
                    units="ºC"
                    enabled={zone.thresholds.airTemperature.enabled}
                    onChange={this.handleInputChange}
                />
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

