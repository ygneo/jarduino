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


export default CreateIrrigationZoneButton

