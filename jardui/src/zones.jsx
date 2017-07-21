import React from 'react'
import ReactDOM from 'react-dom'
import CreateIrrigationZoneButton from './widgets/buttons/create_zone.js'
import IrrigationZoneForm from './forms.js'
import ZonesStorage from './storage.js'
import SoilMoistureLevel from './widgets/soil_moisture_level.js'
import ZoneDataHeader from './zones/zone_data_header.js'
import getForZoneId from './zones/getForZoneId.js'
import timeConverter from './timeConverter.js'


class ZoneData extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            zone: props.zone,
            data: props.data
        };

        this.storage = new ZonesStorage

        this.handleButtonClick = this.handleButtonClick.bind(this)
        this.getLastReadingDateTime = this.getLastReadingDateTime.bind(this)
        this.getIrrigatingStart = this.getIrrigatingStart.bind(this)
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

        this.props.onEditButtonClick(event.target.getAttribute('data-zoneId'));
    }

    getLastReadingDateTime() {
        let lastDateTime

        if (this.state.data && this.state.data.timestamp) {
            lastDateTime = timeConverter(this.state.data.timestamp)
        } else {
            let zoneData = this.storage.getZoneData(this.state.zone.id)

            if (zoneData && zoneData.length) {
                lastDateTime = timeConverter(zoneData[zoneData.length-1].timestamp)
            }
        }

        if (!lastDateTime) {
            lastDateTime = "N/A"
        }

        return lastDateTime
    }

    getLastSensorValue(sensorType) {
        let value = null

        if (this.state.data) {
            value = this.state.data.sensorsData[sensorType]
        } else {
            let zoneData = this.storage.getZoneData(this.state.zone.id)

            if (zoneData && zoneData.length) {
                value = zoneData[zoneData.length-1].sensorsData[sensorType]
            }
        }

        return value
    }

    getIrrigatingStart() {
        let irrigatingStart = Date.parse(this.state.zone.irrigatingStart) / 1000
        return timeConverter(irrigatingStart, false, false)
    }


    render() {
        let zone = this.state.zone
        let id = "zoneData" + zone.id
        let zoneId = {'data-zoneId': zone.id}
        let lastReadingDateTime = this.getLastReadingDateTime()
        let sensorsValues = {
            soilMoisture: this.getLastSensorValue("soilMoisture"),
            airHumidity: this.getLastSensorValue("airHumidity"),
            airTemperature: this.getLastSensorValue("airTemperature")
        }
        let irrigatingStart = this.getIrrigatingStart()
        let barStyles = {
            soilMoisture: {
                width: sensorsValues.soilMoisture + "%"
            },
            airHumidity: {
                width: sensorsValues.airHumidity + "%"
            },
            airTemperature: {
                width: sensorsValues.airTemperature + "%"
            }
        }
        let thClassName = {
            soilMoisture: zone.thresholds.soilMoisture.enabled ? "show" : "hide",
            airHumidity: zone.thresholds.airHumidity.enabled ? "show" : "hide",
            airTemperature: zone.thresholds.airTemperature.enabled ? "show" : "hide"
        }

        return (
            <div id={id} className="data">
                <ZoneDataHeader
                    zone={zone}
                    data={this.state.data}
                />
                <div className="items">
                    <h4>Última lectura: <em>{lastReadingDateTime}</em></h4>
                    <div className="item">
                        <div className="item-value">
                            <span className="label">Humedad del sustrato</span>
                            <span className="value">
                                {sensorsValues.soilMoisture}%
                            </span>
                        </div>
                        <div className="w3-light-grey w3-round value-bar">
                            <div className="w3-container w3-round w3-soilMoisture" style={barStyles.soilMoisture}></div>
                        </div>
                        <div className={`thrContainer ${thClassName.soilMoisture}`}>
                            <div className="thrLine w3-border-blue"></div><div className="thr">Umbral de riego (h) <span>&lt; {this.state.zone.thresholds.soilMoisture.value}%</span></div>
                        </div>
                    </div>
                    <div className="item">
                        <div className="item-value">
                            <span className="label">Humedad del aire</span>
                            <span className="value">
                                {sensorsValues.airHumidity}%
                            </span>
                        </div>
                        <div className="w3-light-grey w3-round value-bar">
                            <div className="w3-container w3-round w3-airHumidity" style={barStyles.airHumidity}></div>
                        </div>
                        <div className={`thrContainer ${thClassName.airHumidity}`}>
                            <div className="thrLine w3-border-red"></div><div className="thr">Umbral de riego (hr) <span>&lt; {this.state.zone.thresholds.airHumidity.value}%</span></div>
                        </div>
                    </div>
                    <div className="item">
                        <div className="item-value">
                            <span className="label">Temperatura del aire</span>
                            <span className="value">
                                {sensorsValues.airTemperature}ºC
                            </span>
                        </div>
                        <div className="w3-light-grey w3-round value-bar">
                            <div className="w3-container w3-round w3-airTemperature" style={barStyles.airTemperature}></div>
                        </div>
                        <div className={`thrContainer ${thClassName.airTemperature}`}>
                            <div className="thrLine w3-border-black"></div><div className="thr">Umbral de riego (t) &gt; {this.state.zone.thresholds.airTemperature.value}ºC</div>
                        </div>
                    </div>
                </div>
                <div className="items">
                    <h4>Riego programado</h4>
                    <div className="item">
                        <span className="label">Inicio</span>
                        <span className="value">
                            {irrigatingStart}
                        </span>
                    </div>
                    <div className="item">
                        <span className="label">Frecuencia</span>
                        <span className="value">
                            cada {this.state.zone.watering_frequence} {this.state.zone.watering_frequence_interval}</span>
                    </div>
                    <div className="item">
                        <span className="label">Duración</span>
                        <span className="value">
                            {this.state.zone.watering_time} {this.state.zone.watering_time_interval}
                        </span>
                    </div>
                </div>
                <div className="buttons">
                    <span className="configure"
                          {...zoneId}
                          onClick={this.handleButtonClick}
                    >MODIFICAR</span>
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
         let dataClassName
         let formClassName
         let element = null

         if (this.state.mode == "creation") {
            element = (
                <section className="form">
                    <IrrigationZoneForm
                        onCancel={this.cancelForm}
                        onDelete={this.deleteZone}
                        onZoneCreated={this.handleZoneCreation}
                    />
                </section>
            )
         } else {
             dataClassName = "show"
             formClassName = "hide"

             if (this.state.mode === "edition") {
                dataClassName = "hide"
                formClassName = "show"
            }

            element = (
                <section className="irrigation_zone">
                <div className={dataClassName}>
                  <ZoneData zone={this.state.zone}
                               ref="zonedata"
                          onCancel={this.cancelForm}
                          onEditButtonClick={this.renderEditForm}
                          data={this.state.data}
                />
                </div>
                <div className={formClassName}>
                  <IrrigationZoneForm
                        ref="form"
                        onCancel={this.cancelForm}
                        onZoneUpdated={this.handleZoneUpdate}
                        onDelete={this.handleZoneDeletion}
                        zone={this.state.zone}
                    />
                </div>
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
        let numZones = 0
        if (this.state.zones) {
            numZones = this.state.zones.length
        }
        let emptyIrrigationZone = <EmptyIrrigationZone onCreateZone={this.handleZoneCreation}/>
        let zoneElements = []


        if (this.state.zones) {
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
        }

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
