import React from 'react'
import ReactDOM from 'react-dom'


class IrrigationZoneForm extends React.Component {
    constructor(props) {
        super(props);
        this.handleCancel = this.handleCancel.bind(this);
    }

    handleCancel(e) {
        this.props.onCancel();
    }

    render () {
        return (
            <form>
                <fieldset>
                    <label for="name">Nombre</label>
                    <input id="name" type="text"></input>
                </fieldset>
                <fieldset>
                    <label for="description">Descripción</label>
                    <input id="description" type="text"></input>
                </fieldset>
                <fieldset className="time_interval">
                    <div id="col1">
                        <label for="watering_frequence">Frecuencia de riego</label>
                        <input id="watering_frequence" type="number"></input>
                    </div>
                    <div className="col2">
                        <label for="watering_frequence_interval">Intervalo</label>
                        <select id="watering_frequence_interval">
                            <option value="s">Segundos</option>
                            <option value="m">Minutos</option>
                            <option value="h">Horas</option>
                            <option value="d">Días</option>
                        </select>
                    </div>
                </fieldset>
                <fieldset className="time_interval">
                    <div id="col1">
                        <label for="watering_time">Tiempo de riego</label>
                        <input id="watering_time" type="number"></input>
                    </div>
                    <div id="col2">
                        <label for="watering_time_interval">Intervalo</label>
                        <select id="watering_time_interval">
                            <option value="s">Segundos</option>
                            <option value="m">Minutos</option>
                            <option value="h">Horas</option>
                            <option value="d">Días</option>
                        </select>
                    </div>
                </fieldset>
                <fieldset>
                    <label for="min_soil_moisture">Humedad</label>
                    <select id="min_soil_moisture">
                        <option value="very_low">Muy baja</option>
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                        <option value="very_high">Muy alta</option>
                    </select>
                </fieldset>
                <div className="buttons">
                    <button onClick={this.handleCancel}>CANCELAR</button>
                    <button type="submit">GUARDAR</button>
                </div>
            </form>
        )
    }
}


export default IrrigationZoneForm

