import React from 'react'
import ReactDOM from 'react-dom'


class ThresholdFieldSet extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            "value": props.value ? props.value : props.defaultValue,
            "enabled": props.enabled
        }

        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    }

    handleRangeChange(event) {
        this.setState({
            "value": event.target.value
        })
        this.props.onChange(event);
    }

    handleCheckboxChange(event) {
        this.setState({
            "enabled": !this.state.enabled
        })
        this.props.onChange(event);
    }

    render () {
        let checkBoxId = this.props.id + "cb"
        let checkBoxName = "cb_" + this.props.name

        let checkBoxOpts = {}
        let rangeInputOpts = {}

        if (this.state.enabled) {
            checkBoxOpts = {'checked': 'checked'}
        }

        if (!this.state.enabled) {
            rangeInputOpts['disabled'] = 'disabled'
        }

        return (
            <fieldset className="threshold">
                <input
                    id={checkBoxId}
                    name={checkBoxName}
                    type="checkbox"
                    onChange={this.handleCheckboxChange}
                    {...checkBoxOpts}
                />
                <label htmlFor={checkBoxId}>{this.props.label}</label>
                <span className="rangeValue">{this.state.value} {this.props.units}</span>
                <input
                    id={this.props.id}
                    name={this.props.name}
                    type="range"
                    min="{props.rangeMin}"
                    max="{props.rangeMax}"
                    step="{props.rangeStep}"
                    onChange={this.handleRangeChange}
                    value={this.state.value}
                    {...rangeInputOpts}
                />
            </fieldset>
        )
    }
}


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
                       value={this.props.value}
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
                           value={this.props.frequenceValue}
                           onChange={this.handleInputChange}
                    ></input>
                </div>
                <div className="col2">
                    <label for={interval_name}>{this.props.intervalLabel}</label>
                    <select name={interval_name}
                            id={interval_name}
                            value={this.props.intervalValue}
                            onChange={this.handleInputChange}>
                        <option value="s">Segundos</option>
                        <option value="m">Minutos</option>
                        <option value="h">Horas</option>
                    </select>
                </div>
            </fieldset>
        )
    }
}


const fieldsets = {
    "TextInputFieldSet": TextInputFieldSet,
    "TimeIntervalFieldSet": TimeIntervalFieldSet,
    "ThresholdFieldSet": ThresholdFieldSet

}

export default fieldsets
