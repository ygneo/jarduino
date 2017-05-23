import React from 'react'
import ReactDOM from 'react-dom'


class CreateIrrigationZoneButton extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        this.props.onClick();
    }

    render () {
        return (
            <div onClick={this.handleClick}>
                <span id="icon"></span>
                <p>CREAR ZONA DE RIEGO</p>
            </div>
        )
    }
}


class UploadCodeToDeviceButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            "enabled": props.enabled
        }
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        if (this.state.enabled) {
            this.props.onClick();
        }
    }

    render () {
        let uploadButtonClassName = "disabled"

        if (this.state.enabled === true) {
            uploadButtonClassName = "enabled"
        }

        return (
            <button
                type="button"
                className={uploadButtonClassName}
                onClick={this.uploadCodeToDevice}
            >REPROGRAMAR</button>
        )
    }
}


export default CreateIrrigationZoneButton

