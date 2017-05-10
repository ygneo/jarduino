import React from 'react'
import ReactDOM from 'react-dom'
import CreateIrrigationZoneButton from './buttons.js'
import IrrigationZoneForm from './forms.js'


class IrrigationZone extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mode: props.mode ? props.mode : "empty"
        };

        this.renderCreateForm = this.renderCreateForm.bind(this);
        this.cancelForm = this.cancelForm.bind(this);
        this.submitForm = this.submitForm.bind(this);
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
                        onSubmit={this.submitForm}
                    />
                </section>
            )
        } else if (this.state.mode == "occupied") {
            className = "irrigation_zone"
            element = (
                <section className={className}>
                    DATA
                </section>
            )
        }

        return element
    }

    renderCreateForm() {
        this.setState({mode: "creation"})
    }

    cancelForm() {
        this.setState({mode: "empty"})
    }

    submitForm(event) {
        this.setState({mode: "occupied"})
    }

}

export default IrrigationZone
