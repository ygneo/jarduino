import React from 'react'
import ReactDOM from 'react-dom'
import CreateIrrigationZoneButton from './buttons.js'
import IrrigationZoneForm from './forms.js'
import ZonesStorage from './storage.js'


class ZoneData extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            zone: props.zone
        };

        this.handleButtonClick = this.handleButtonClick.bind(this)
    }

    handleButtonClick(event) {
        const target = event.target
        const className = target.className

        if (className == "edit_button") {
            this.props.onEditButtonClick(event.target.getAttribute('data-zoneId'));
        }
    }

    render() {
        let zone = this.state.zone
        let zoneId = {'data-zoneId': zone.id}

        return (
            <div id="data">
                <div id="header">
                    <div id="content">
                        <h2>{zone.name}</h2>
                        <h3>{zone.description}</h3>
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
            zone: props.zone
        };

        this.storage = new ZonesStorage()

        this.handleZoneCreation = this.handleZoneCreation.bind(this)
        this.handleZoneDeletion = this.handleZoneDeletion.bind(this)
        this.handleZoneUpdate = this.handleZoneUpdate.bind(this)

        this.renderEditForm = this.renderEditForm.bind(this)
        this.cancelForm = this.cancelForm.bind(this)
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
            "mode": "normal"
        }

        this.handleZoneCreation = this.handleZoneCreation.bind(this);
        this.handleZoneCreated = this.handleZoneCreated.bind(this);
        this.handleZoneUpdated = this.handleZoneUpdated.bind(this);
        this.handleZoneDeletion = this.handleZoneDeletion.bind(this);
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
        
    }

    render() {
        let numZones = this.state.zones.length
        let emptyIrrigationZone = <EmptyIrrigationZone onCreateZone={this.handleZoneCreation}/>
        let zoneElements = []

        this.state.zones.map((zone,i) => {
            zoneElements.push(<IrrigationZone
                                  mode="show"
                                  zone={zone}
                                  onZoneDeletion={this.handleZoneDeletion}
                                  onZoneUpdated={this.handleZoneCreated}
                              />)
        })

        if (this.state.mode =="creating") {
            zoneElements.push(<IrrigationZone
                                  mode="creation"
                                  onZoneCreated={this.handleZoneCreated}
                                  onZoneUpdated={this.handleZoneCreated}
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
