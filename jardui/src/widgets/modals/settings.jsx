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

class ConnectionSchemeTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            "zones": props.zones,
            "scheme": this.buildScheme(props.zones)
        }

        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.buildTable = this.buildTable.bind(this);
        this.buildSelectBox = this.buildSelectBox.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            isOpen: nextProps.isOpen,
            scheme: this.buildScheme(nextProps.zones),
            zones: nextProps.zones
        })
    }

    handleCloseModal () {
        this.props.onClose()
    }

    buildScheme(zones) {
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

    buildSelectBox(name, id) {
        let selName = name + "connection" + id
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
                <select name={selName}>
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
                <th>
                    <td>Componente</td><td>Conexión</td>
                </th>
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

        this.state = {
            isOpen: props.isOpen,
            settings: {
                "sendingFrequence": 5,
                "sendingInterval": "s",
                "readingsCount": 3
            },
            "zones": props.zones
        }

        this.handleCloseModal = this.handleCloseModal.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            isOpen: nextProps.isOpen,
            zones: nextProps.zones
        })
    }

    handleCloseModal () {
        this.props.onClose()
    }

    render () {
        return (
            <div id="settingsModal" className="modal">
                <div className="modal-header">
                    <span className="title">Configuración del dispositivo</span>
                    <span className="close" onClick={this.handleCloseModal}>&times;</span>
                </div>
                <div className="modal-content">
                    <form>
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
                        />
                        <TextInputFieldSet
                            label="Número de lecturas entre envíos"
                            name="readingsCount"
                            id="readingsCount"
                            type="text"
                            value={this.state.settings.readingsCount}
                        />
                        <fieldset>
                            <h4>Plantilla de código fuente</h4>
                            <fieldset>
                                <input type="file" id="codeTemplate" name="codeTemplate"/>
                            </fieldset>
                        </fieldset>
                        <fieldset>
                            <h4>Esquema de conexión</h4>
                            <ConnectionSchemeTable
                                zones={this.state.zones}
                            />
                            <p>Notas</p>
                            <p className="small">[OG] Indica una referencia a una entrada del shield OpenGarden.</p>
                            <p className="small">Si se utiliza el sensor DHT22 (humedad y temperatura del aire), se conectará a la entrada DHT22 de OpenGarden.</p>

                        </fieldset>
                    </form>
                </div>
            </div>
        )
    }
}

export default SettingsModal
