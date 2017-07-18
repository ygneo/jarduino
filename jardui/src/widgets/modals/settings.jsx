import React from 'react'
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import fieldsets from '../../inputs.js'


const TimeIntervalFieldSet = fieldsets.TimeIntervalFieldSet
const TextInputFieldSet = fieldsets.TextInputFieldSet


class SettingsModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: props.isOpen,
            settings: {
                "sendingFrequence": 5,
                "sendingInterval": "s",
                "readingsCount": 3
            }
        }

        this.handleCloseModal = this.handleCloseModal.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            isOpen: nextProps.isOpen
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
                                    <label>Plantilla de código fuente</label>
                                    <input type="file" id="codeTemplate" name="codeTemplate"/>
                                </fieldset>
                            </fieldset>
                            <fieldset>
                                <h4>Esquema de conexión</h4>
                            </fieldset>
                        </form>
                    </div>
                </div>
            )
    }
}

export default SettingsModal
