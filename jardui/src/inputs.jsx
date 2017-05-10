import React from 'react'
import ReactDOM from 'react-dom'


class TextInputFieldSet extends React.Component {
    constructor(props) {
        super(props);

        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event) {
        this.props.onChange(event);
    }

    render () {
        return (
            <fieldset>
                <label for={this.props.id}>{this.props.label}</label>
                <input name={this.props.name}
                       id={this.props.name}
                       type="text"
                       onChange={this.handleInputChange}>
                </input>
            </fieldset>
        )
    }
}


class TimeIntervalFieldSet extends React.Component {
    constructor(props) {
        super(props);

        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event) {
        this.props.onChange(event);
    }

    render () {
        let interval_name = this.props.id + '_interval'

        return (
            <fieldset className="time_interval">
                <div id="col1">
                    <label for={this.props.id}>{this.props.frequenceLabel}</label>
                    <input name={this.props.name}
                           id="{this.props.id}"
                           type="number"
                           onChange={this.handleInputChange}
                    ></input>
                </div>
                <div className="col2">
                    <label for={interval_name}>{this.props.intervalLabel}</label>
                    <select name={interval_name}
                            id={interval_name}
                            onChange={this.handleInputChange}>
                        <option value="s">Segundos</option>
                        <option value="m">Minutos</option>
                        <option value="h">Horas</option>
                        <option value="d">Días</option>
                    </select>
                </div>
            </fieldset>
        )
    }
}


const fieldsets = {
    "TextInputFieldSet": TextInputFieldSet,
    "TimeIntervalFieldSet": TimeIntervalFieldSet
}

export default fieldsets
