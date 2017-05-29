import React from 'react'
import ReactDOM from 'react-dom'
import CreateIrrigationZoneButton from './widgets/buttons/create_zone.js'
import IrrigationZoneForm from './forms.js'
import ZonesStorage from './storage.js'


function zeroPadding(n, digits=2) {
    return ('00'+n).slice(-digits);
}


function timeConverter(UNIX_timestamp){
    let a = new Date(UNIX_timestamp * 1000);
    let year = zeroPadding(a.getFullYear());
    let month = zeroPadding(a.getMonth());
    let date = zeroPadding(a.getDate());
    let hour = zeroPadding(a.getHours());
    let min = zeroPadding(a.getMinutes());
    let sec = zeroPadding(a.getSeconds());
    let time = date + '/' + month + '/' + year + ' ' + hour + ':' + min + ':' + sec ;

    return time;
}


class ZoneData extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            zone: props.zone,
            data: props.data
        };

        this.handleButtonClick = this.handleButtonClick.bind(this)
        this.getLastReadTime = this.getLastReadTime.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            "data": nextProps.data
        })
    }

    handleButtonClick(event) {
        const target = event.target
        const className = target.className

        if (className == "edit_button") {
            this.props.onEditButtonClick(event.target.getAttribute('data-zoneId'));
        }
    }

    getLastReadTime(){
        let lastReadTime

        if (this.state.data) {
            lastReadTime = timeConverter(this.state.data.timestamp)
            return <h3>Última lectura {lastReadTime}</h3>
        }
    }

    getLastValue(){
        let lastValue

        if (this.state.data) {
            lastValue = this.state.data.value
            return <h3>{lastValue}</h3>
        }
    }

    render() {
        let zone = this.state.zone
        let zoneId = {'data-zoneId': zone.id}
        let lastReadTime = this.getLastReadTime()
        let lastValue = this.getLastValue()

        return (
            <div id="data">
                <div id="header">
                    <div id="content">
                        <h2>{zone.name}</h2>
                        <h3>{zone.description}</h3>
                        {lastReadTime}
                        {lastValue}
                    </div>
                </div>
                <div className="items">
                    <div className="item">
                        <span className="label">Frecuencia de riego</span>
                        <span className="value">
                            cada {zone.watering_frequence} {zone.watering_frequence_interval}
                        </span>
                    </div>
                    <div className="item">
                        <span className="label">Tiempo de riego</span>
                        <span className="value">
                            {zone.watering_time} {zone.watering_time_interval}
                        </span>
                    </div>
                    <div className="item">
                        <span className="label">Umbral de humedad</span>
                        <span className="value">
                            {zone.min_soil_moisture}
                        </span>
                    </div>
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
            "data": []
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
            if (data.type === "sensors") {
                this.updateSensorsData(data)
            }
        }
    }

    getZoneData(id) {
        let data = {}

        if (this.state.data) {
            data = this.state.data[id]
        }

        return data
    }

    updateSensorsData(data) {
        let zonesData = []

        data.sensorsData.map((sensorData, i) => {
            zonesData.push({
                "timestamp": data.timestamp,
                "type": data.type,
                "id": sensorData.id,
                "value": sensorData.value
            })
        })

        this.setState({
            "data": zonesData
        })
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
