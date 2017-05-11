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

class IrrigationZone extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mode: props.mode ? props.mode : "empty",
            zone: props.zone
        };

        this.storage = new ZonesStorage()

        this.renderCreateForm = this.renderCreateForm.bind(this)
        this.renderEditForm = this.renderEditForm.bind(this)
        this.cancelForm = this.cancelForm.bind(this)
        this.renderZoneData = this.renderZoneData.bind(this)
    }

    render() {
        let element
        let className

        if (this.state.mode === "empty") {
            className = "create_irrigation_zone"
            element = (
                <section className={className}>
                    <div className={`card ${className}`}>
                        <CreateIrrigationZoneButton onClick={this.renderCreateForm}/>
                    </div>
                    <div className={`card {className}`}>
                        <span className="help">Configura una nueva zona de riego en el sistema</span>
                    </div>
                </section>
            )
        }
        else if (this.state.mode == "creation") {
            className = "form"
            element = (
                <section className={className}>
                    <IrrigationZoneForm
                        onCancel={this.cancelForm}
                        onSubmit={this.renderZoneData}
                    />
                </section>
            )
        } else if (this.state.mode == "show") {
            className = "irrigation_zone"

            element = (
                <section className={className}>
                    <ZoneData zone={this.state.zone}
                              mode="edit"
                              onEditButtonClick={this.renderEditForm}
                    />
                </section>
            )
        } else if (this.state.mode == "edition") {
            className = "form"

            element = (
                <section className={className}>
                    <IrrigationZoneForm
                        mode="create"
                        onCancel={this.cancelForm}
                        onSubmit={this.renderZoneData}
                        zone={this.state.zone}
                    />
                </section>
            )
        }

        return element
    }

    renderCreateForm() {
        this.setState({mode: "creation"})
    }

    renderEditForm(zoneId) {
        this.setState({
            mode: "edition",
            "zoneId": zoneId
        })
    }

    cancelForm() {
        if (this.state.zone == null) {
            this.setState({mode: "empty"})
        } else {
            this.setState({mode: "show"})
        }
    }

    renderZoneData(zoneId) {
        this.setState({
            mode: "show",
            zoneId: zoneId
        })
    }
}


class Zones {
    constructor() {
        this.storage = new ZonesStorage()

        this.renderZones = this.renderZones.bind(this)
    }

    renderZones(element) {
        let zones = this.storage.getZones()

        if (zones == null) {
            ReactDOM.render(
                <div id="zones">
                    <IrrigationZone mode="empty" />
                </div>,
                element
            )
        } else {
            ReactDOM.render(
                <div id="zones">
                    {zones.map((zone,i) => {
                         return <IrrigationZone mode="show" zone={zone} />
                    })}
                    <IrrigationZone mode="empty" />
                </div>,
                element
            )
        }
    }
}


export default Zones
