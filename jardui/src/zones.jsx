import React from 'react'
import ReactDOM from 'react-dom'
import CreateIrrigationZoneButton from './widgets/buttons/create_zone.js'
import IrrigationZoneForm from './forms.js'
import ZonesStorage from './storage.js'
import SoilMoistureLevel from './widgets/soil_moisture_level.js'
import ZoneDataHeader from './zones/zone_data_header.js'
import getForZoneId from './zones/getForZoneId.js'


function zeroPadding(n, digits=2) {
    return ('00'+n).slice(-digits);
}


function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    var year = a.getUTCFullYear();
    var month = months[a.getUTCMonth()];
    var date = a.getUTCDate();
    var hour = a.getUTCHours();
    var min = zeroPadding(a.getUTCMinutes());
    var sec = zeroPadding(a.getUTCSeconds());
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;

    return time;
}


class ZoneData extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            zone: props.zone,
            data: props.data
        };

        this.storage = new ZonesStorage

        this.handleButtonClick = this.handleButtonClick.bind(this)
        this.getLastTimestamp = this.getLastTimestamp.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        let data = nextProps.data

        this.setState({
            zone: nextProps.zone,
            data: data
        })
    }

    handleButtonClick(event) {
        const target = event.target
        const className = target.className

        if (className == "edit_button") {
            this.props.onEditButtonClick(event.target.getAttribute('data-zoneId'));
        }
    }

    getLastTimestamp() {
        let timestamp = null

        if (this.state.data) {
            timestamp = this.state.data.timestamp
        } else {
            let zoneData = this.storage.getZoneData(this.state.zone.id)

            if (zoneData) {
                timestamp = zoneData[zoneData.length-1].timestamp
            }
        }

        return timeConverter(timestamp)
    }

    getLastSensorValue(sensorType) {
        let value = null

        if (this.state.data) {
            value = this.state.data.sensorsData[sensorType]
        } else {
            let zoneData = this.storage.getZoneData(this.state.zone.id)

            if (zoneData) {
                value = zoneData[zoneData.length-1].sensorsData[sensorType]
            }
        }

        return value
    }

    render() {
        let zone = this.state.zone
        let zoneId = {'data-zoneId': zone.id}
        let timestamp = this.getLastTimestamp()
        let sensorsValues = {
            soilMoisture: this.getLastSensorValue("soilMoisture"),
            airHumidity: this.getLastSensorValue("airHumidity"),
            airTemperature: this.getLastSensorValue("airTemperature")
        }

        return (
            <div id="data">
                <ZoneDataHeader
                    zone={zone}
                    data={this.state.data}
                />
                <div className="items">
                    Ultima lectura: {timestamp}
                    <div className="item">
                        <span className="label">Humedad del sustrato</span>
                        <span className="value">
                            {sensorsValues.soilMoisture} % ({this.state.zone.min_soil_moisture} %)
                        </span>
                    </div>
                    <div className="item">
                        <span className="label">Humedad relativa</span>
                        <span className="value">
                            {sensorsValues.airHumidity} %
                        </span>
                    </div>
                    <div className="item">
                        <span className="label">Temperatura ambiente</span>
                        <span className="value">
                            {sensorsValues.airTemperature} ºC
                        </span>
                    </div>
                </div>
                <div className="settings">
                    Tiempo de riego {this.state.zone.watering_time} {this.state.zone.watering_time_interval}
                </div>
                <div className="buttons">
                    <span className="edit_button"
                          {...zoneId}
                          onClick={this.handleButtonClick}
                    />
                </div>
            </div>
        )
    }
}


class EmptyIrrigationZone extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mode: props.mode ? props.mode : "visible"
        };

        this.handleCreateZone = this.handleCreateZone.bind(this)
    }

    handleCreateZone() {
        this.setState({mode: "hidden"})
        this.props.onCreateZone()
    }

    render() {
        let className = "create_irrigation_zone"

        if (this.state.mode === "visible") {
            return (
                <section className={className}>
                    <div className={`card ${className}`}>
                        <CreateIrrigationZoneButton onClick={this.handleCreateZone}/>
                    </div>
                    <div className={`card {className}`}>
                        <span className="help">Configura una nueva zona de riego en el sistema</span>
                    </div>
                </section>
            )
        }
        return null
    }
}


class IrrigationZone extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            mode: props.mode,
            zone: props.zone,
            data: props.data
        }

        this.storage = new ZonesStorage()

        this.handleZoneCreation = this.handleZoneCreation.bind(this)
        this.handleZoneDeletion = this.handleZoneDeletion.bind(this)
        this.handleZoneUpdate = this.handleZoneUpdate.bind(this)

        this.renderEditForm = this.renderEditForm.bind(this)
        this.cancelForm = this.cancelForm.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            "data": nextProps.data
        })
    }

    render() {
        let className
        let element = null

        if (this.state.mode == "creation") {
            className = "form"
            element = (
                <section className={className}>
                    <IrrigationZoneForm
                        onCancel={this.cancelForm}
                        onDelete={this.deleteZone}
                        onZoneCreated={this.handleZoneCreation}
                    />
                </section>
            )
        } else if (this.state.mode == "show") {
            className = "irrigation_zone"

            element = (
                <section className={className}>
                    <ZoneData zone={this.state.zone}
                              onCancel={this.cancelForm}
                              onEditButtonClick={this.renderEditForm}
                              data={this.state.data}
                    />
                </section>
            )
        } else if (this.state.mode == "edition") {
            className = "form"

            element = (
                <section className={className}>
                    <IrrigationZoneForm
                        onCancel={this.cancelForm}
                        onZoneUpdated={this.handleZoneUpdate}
                        onDelete={this.handleZoneDeletion}
                        zone={this.state.zone}
                    />
                </section>
            )
        }

        return element
    }

    renderData(zone) {
        this.setState({
            mode: "show",
            zone: zone
        })
    }

    handleZoneCreation(zone) {
        this.renderData(zone)
        this.props.onZoneCreated()
    }

    handleZoneDeletion() {
        this.props.onZoneDeletion()
    }

    handleZoneUpdate(zone) {
        this.renderData(zone)
        this.props.onZoneUpdated()
    }


    renderEditForm(zoneId) {
        let zone = this.storage.getZone(zoneId)

        this.setState({
            "mode": "edition",
            "zone": zone
        })
    }

    cancelForm() {
        if (this.state.zone !== undefined) {
            this.setState({mode: "show"})
        } else {
            this.setState({mode: "dead"})
            this.props.onZoneDeletion()
        }
    }
}


class Zones extends React.Component {
    constructor(props) {
        let zones

        super(props)

        this.storage = new ZonesStorage()

        zones = this.storage.getZones()

        this.state = {
            "zones": zones ? zones : [],
            "mode": "normal",
            "data": props.data
        }

        this.handleZoneCreation = this.handleZoneCreation.bind(this);
        this.handleZoneCreated = this.handleZoneCreated.bind(this);
        this.handleZoneUpdated = this.handleZoneUpdated.bind(this);
        this.handleZoneDeletion = this.handleZoneDeletion.bind(this);

        this.getZoneData = this.getZoneData.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        let data = nextProps.data

        if (data) {
            this.setState({
                data: data
            })
        }
    }

    getZoneData(id) {
        let data

        if (this.state.data) {
            let sensorsData = getForZoneId(this.state.data.sensorsData, id)
            let actuatorsData = getForZoneId(this.state.data.actuatorsData, id)
            let sensorsDataPerType = {}

            let sensorTypes = ["soilMoisture", "airTemperature", "airHumidity"]
            for (let i in sensorTypes) {
                let sensorType = sensorTypes[i]

                let sensorData = sensorsData.find(function (sensorData) {
                    return sensorData.type === sensorTypes[i]
                })

                sensorsDataPerType[sensorType] = sensorData.value
            }

            data = {
                timestamp: this.state.data.timestamp,
                sensorsData: sensorsDataPerType,
                actuatorsData: actuatorsData
            }
        }

        return data
    }

    handleZoneCreation() {
        this.setState({"mode": "creating"})
    }

    handleZoneCreated() {
        this.setState({
            "mode": "normal",
            "zones": this.storage.getZones()
        })
    }

    handleZoneDeletion() {
        this.setState(
            {
                "mode": "normal",
                "zones": this.storage.getZones()
            })
    }

    handleZoneUpdated() {
        this.props.onZonesUpdated()
    }

    render() {
        let numZones = this.state.zones.length
        let emptyIrrigationZone = <EmptyIrrigationZone onCreateZone={this.handleZoneCreation}/>
        let zoneElements = []


        this.state.zones.map((zone,i) => {
            let data = this.getZoneData(i)

            zoneElements.push(<IrrigationZone
                                  mode="show"
                                  zone={zone}
                                  data={data}
                                  onZoneDeletion={this.handleZoneDeletion}
                                  onZoneUpdated={this.handleZoneUpdated}
                              />)
        })

        if (this.state.mode =="creating") {
            zoneElements.push(<IrrigationZone
                                  mode="creation"
                                  onZoneCreated={this.handleZoneCreated}
                                  onZoneUpdated={this.handleZoneUpdated}
                                  onZoneDeletion={this.handleZoneDeletion}
                              />)
        } else {
            zoneElements.push(emptyIrrigationZone)
        }

        return (
        <div id="zones">
            {zoneElements}
        </div>
        )
    }
}


export default Zones
