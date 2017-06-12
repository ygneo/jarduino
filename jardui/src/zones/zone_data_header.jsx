import React from 'react'
import ReactDOM from 'react-dom'
import ZoneDataContent from './zone_data_content.js'


export default class ZoneDataHeader extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            mode: props.mode,
            zone: props.zone,
            data: props.data
        };

        this.handleChangeModeToGraph = this.handleChangeModeToGraph.bind(this)
        this.handleChangeModeToSymbolic = this.handleChangeModeToSymbolic.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            mode: nextProps.mode,
            zone: nextProps.zone,
            data: nextProps.data
        })
    }

    componentWillMount() {
        // render graph with historic data
    }

    handleChangeModeToSymbolic() {
        this.setState({
            mode: "symbolic"
        })
    }

    handleChangeModeToGraph() {
        this.setState({
            mode: "graph"
        })
    }

    render() {
        return (
            <div id="header">
                <div className="header-container">
                    <div className="attributes">
                        <h2>{this.state.zone.name}</h2>
                        <h3>{this.state.zone.description}</h3>
                    </div>
                    <div className="actions">
                        <button type="button" onClick={this.handleChangeModeToGraph}>Gráfico</button>
                        <button type="button" onClick={this.handleChangeModeToSymbolic}>Símbolos</button>
                    </div>
                </div>
                <ZoneDataContent
                    mode={this.state.mode}
                    zone={this.state.zone}
                    data={this.state.data}
                />
            </div>
        )
    }
}
