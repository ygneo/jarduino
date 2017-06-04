import React from 'react'
import ReactDOM from 'react-dom';
import Modal from 'react-modal';




class SettingsModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: props.isOpen
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
        if (this.state.isOpen === true) {
            return (
                <div id="settingsModal" className="modal">
                    <div className="modal-header">
                        <span className="title">Configuración</span>
                        <span className="close" onClick={this.handleCloseModal}>&times;</span>
                    </div>
                    <div className="modal-content">
                        <form>
                            <fieldset>
                                <legend>Frecuencia de envio de lecturas</legend>
                                <label for="push_time">Cada</label>
                            </fieldset>
                        </form>
                    </div>
                </div>
            )
        }
        return null
    }
}

export default SettingsModal
