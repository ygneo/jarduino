import React from 'react'
import SettingsModal from '../modals/settings.js'


class SettingsButton extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            showModal: false
        };

        this.handleOpenModal = this.handleOpenModal.bind(this)
    }

    handleOpenModal () {
        this.props.onClick()
    }


    render () {
        return (
            <div>
                <button
                    type="button"
                    id="settings"
                    onClick={this.handleOpenModal}>
                    <span className="icon"></span>CONFIGURAR
                </button>
            </div>
        )
    }
}

export default SettingsButton
