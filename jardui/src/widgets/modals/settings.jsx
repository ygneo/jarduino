import React from 'react'
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import fieldsets from '../../inputs.js'


const TimeIntervalFieldSet = fieldsets.TimeIntervalFieldSet
const TextInputFieldSet = fieldsets.TextInputFieldSet

const sensorOptions = [
    {value: "99", name: "[OG] MOIST"},
    {value: "A0", name: "A0"},
    {value: "A1", name: "A1"},
    {value: "A1", name: "A1"},
    {value: "A2", name: "A2"},
    {value: "A3", name: "A3"},
    {value: "A4", name: "A4"},
    {value: "A5", name: "A5"}
]

const electroOptions = [
    {value: "991", name: "[OG] Electrovalve/Motor 1"},
    {value: "992", name: "[OG] Electrovalve/Motor 2"},
    {value: "993", name: "[OG] Electrovalve/Motor 3"},
    {value: "D2", name: "D2"},
    {value: "D3", name: "D3"},
    {value: "D4", name: "D4"},
    {value: "D5", name: "D5"},
    {value: "D6", name: "D6"},
    {value: "D7", name: "D7"},
]

function buildScheme(zones) {
    let scheme = []

    if (zones) {
        zones.map((zone,i) => {
            scheme.push({
                "sensor": sensorOptions[i],
                "electro": electroOptions[i]
            })
        })
    }
    return scheme;
}

function getOption(value, type, zoneId) {
    let option = {}

    if (type == "sensor") {
        sensorOptions.map((opt,i) => {
            if (opt.value === value) {
                option = opt
            }
        })
    } else if (type === "electro") {
        electroOptions.map((opt,i) => {
            if (opt.value === value) {
                option = opt
            }
        })
    }

    return option;
}



class ConnectionSchemeTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            "zones": props.zones,
            "scheme": props.scheme
        }

        this.handleInputChange = this.handleInputChange.bind(this);
        this.buildTable = this.buildTable.bind(this);
        this.buildSelectBox = this.buildSelectBox.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            isOpen: nextProps.isOpen,
            zones: nextProps.zones
        })
    }

    handleInputChange(event) {
        const target = event.target
        const value = target.type === 'checkbox' ? target.checked : target.value
        const name = target.name
        let scheme = this.state.scheme
        let zoneId

        if (name.startsWith("sensorconnection")) {
            zoneId = name.split("_")[1]
            scheme[zoneId]["sensor"] = getOption(value, "sensor", zoneId)
        } else if (name.startsWith("electroconnection")) {
            zoneId = name.split("_")[1]
            scheme[zoneId]["electro"] = getOption(value, "electro", zoneId)
        }

        this.setState({
            'scheme': scheme
        })

        this.props.onChange(event)
    }

    buildSelectBox(name, id) {
        let selName = name + "connection_" + id
        let sensorSelOptions = []
        let electroSelOptions = []

        sensorOptions.map((opt,i) => {
            let sel = {}

            if (this.state.scheme[id].sensor.value === opt.value) {
                sel = {"selected": "selected"}
            }

            sensorSelOptions.push(<option value={opt.value} {...sel}>{opt.name}</option>)
        })

        electroOptions.map((opt,i) => {
            let sel = {}

            if (this.state.scheme[id].electro.value === opt.value) {
                sel = {"selected": "selected"}
            }

            electroSelOptions.push(<option value={opt.value} {...sel}>{opt.name}</option>)
        })

        if (name === "sensor") {
            return (
                <select name={selName}
                        onChange={this.handleInputChange}
                >
                    {sensorSelOptions}
                </select>
            )
        } else if (name === "electro") {
            return (
                <select name={name}>
                    {electroSelOptions}
                </select>
            )
        }
    }

    buildTable () {
        let elements = []

        this.state.zones.map((zone,i) => {
            let sensorSelectBox = this.buildSelectBox("sensor", i)
            let electroSelectBox = this.buildSelectBox("electro", i)

            elements.push(<h5>{zone.name}</h5>);
            elements.push(<table>
                <tr>
                    <th>Componente</th><th>Conexión</th>
                </tr>
                <tr><td>Sensor humedad sustrato</td><td>{sensorSelectBox}</td></tr>
                <tr><td>Electroválvula</td><td>{electroSelectBox}</td></tr>
            </table>
            )
        })

        return (
            <div>
                {elements}
            </div>
        )
    }

    render () {
        if (this.state.zones) {
            return this.buildTable();
        } else {
            return (<p>No hay zonas definidas.</p>)
        }
    }
}

class SettingsModal extends React.Component {
    constructor(props) {
        super(props);

        let settings = {
            "sendingFrequence": 5,
            "sendingInterval": "s",
            "readingsCount": 3,
            "codeTemplatePath": "/home/ygneo/dev/jarduino/sketches/jarduino_over_opengarden/",
            "scheme": buildScheme(props.zones)
        }
        let savedSettings = localStorage.getItem("settings")

        if (savedSettings) {
            settings = JSON.parse(savedSettings)
        }

        this.state = {
            isOpen: props.isOpen,
            settings: settings,
            zones: props.zones
        }

        localStorage.setItem("settings", JSON.stringify(settings))

        this.handleCloseModal = this.handleCloseModal.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        let settings = this.state.settings

        this.setState({
            isOpen: nextProps.isOpen,
            zones: nextProps.zones,
            settings: settings
        })
    }

    handleInputChange (event) {
        const target = event.target
        const value = target.type === 'checkbox' ? target.checked : target.value
        const name = target.name
        let settings = this.state.settings
        let zoneId

        if (name.startsWith("sensorconnection")) {
            zoneId = name.split("_")[1]
            settings.scheme[zoneId]["sensor"] = getOption(value, "sensor", zoneId)
        } else if (name.startsWith("electroconnection")) {
            zoneId = name.split("_")[1]
            settings.scheme[zoneId]["electro"] = getOption(value, "electro", zoneId)
        } else {
            settings[name] = value
        }

        this.setState({
            'settings': settings
        })
    }

    handleSubmit(event) {
        event.preventDefault()

        console.log("SUBMIT")
        console.log(this.state.settings)

        localStorage.setItem("settings", JSON.stringify(this.state.settings))

        this.props.onClose()
    }

    handleCloseModal () {
        this.props.onClose()
    }

    handleCancel(e) {
        this.props.onClose();
    }

    render () {
        return (
            <div id="settingsModal" className="modal">
                <div className="modal-header">
                    <span className="title">Configuración del dispositivo</span>
                    <span className="close" onClick={this.handleCloseModal}>&times;</span>
                </div>
                <div className="modal-content">
                    <form onSubmit={this.handleSubmit}>
                        <h4>Envío de datos</h4>
                        {/* <fieldset>
                            <legend>Destino</legend>
                            <div className="targets">
                            <input id="usb" type="radio" name="dataTarget" value="usb"/>
                            <label for="usb" className="radioLabel">Puerto USB</label>
                            <input id="http" type="radio" name="dataTarget" value="http"/>
                            <label for="http" className="radioLabel">Servidor HTTP</label>
                            </div>
                            <label for="sendDataURL">URL para envio de datos (POST)</label>
                            <input id="sendDataURL"
                            type="text"
                            name="sendDataURL"
                            value="http://localhost:8000/data/"/>
                            <label for="getDataURL">URL para recepción de datos (GET)</label>
                            <input id="sendDataURL"
                            type="text"
                            name="sendDataURL"
                            value="http://localhost:8000/data/"/>
                            </fieldset> */}
                        <TimeIntervalFieldSet
                            frequenceLabel="Frecuencia"
                            intervalLabel="Intervalo"
                            id="sendingFrequence"
                            name="sendingFrequence"
                            frequenceValue={this.state.settings.sendingFrequence}
                            intervalValue={this.state.settings.sendingInterval}
                            onChange={this.handleInputChange}
                        />
                        <TextInputFieldSet
                            label="Número de lecturas entre envíos"
                            name="readingsCount"
                            id="readingsCount"
                            type="text"
                            value={this.state.settings.readingsCount}
                            onChange={this.handleInputChange}
                        />
                        <p className="small">Ten en cuenta que cada lectura puede añadir un retraso de varios segundos, necesario para estabilizar o iniciar los sensores.</p>
                        <fieldset>
                            <h4>Ruta de la plantilla de código fuente</h4>
                            <TextInputFieldSet
                                label="Número de lecturas entre envíos"
                                name="codeTemplatePath"
                                id="codeTemplatePath"
                                type="text"
                                value={this.state.settings.codeTemplatePath}
                                onChange={this.handleInputChange}
                            />
                        </fieldset>
                        <fieldset>
                            <h4>Esquema de conexión</h4>
                            <ConnectionSchemeTable
                                zones={this.state.zones}
                                scheme={this.state.settings.scheme}
                                onChange={this.handleInputChange}
                            />
                                         <p className="small">[OG] Indica una referencia a una entrada del shield OpenGarden. Si se utiliza el sensor DHT22 (humedad y temperatura del aire), se conectará a la entrada DHT22 de OpenGarden.</p>

                        </fieldset>
                        <div className="actions">
                            <button type="button" onClick={this.handleCancel}>CANCELAR</button>
                            <button type="submit">GUARDAR</button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default SettingsModal
