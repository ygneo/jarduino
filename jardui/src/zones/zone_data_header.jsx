import React from 'react'
import ReactDOM from 'react-dom'
import ZoneDataContent from './zone_data_content.js'


export default class ZoneDataHeader extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            zone: props.zone,
            data: props.data
        };

    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            zone: nextProps.zone,
            data: nextProps.data
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
                </div>
                <ZoneDataContent
                    zone={this.state.zone}
                    data={this.state.data}
                />
            </div>
        )
    }
}
