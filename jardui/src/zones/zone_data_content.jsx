import React from 'react'
import ReactDOM from 'react-dom'
import SoilMoistureLevel from '../widgets/soil_moisture_level.js'
import Rickshaw from 'rickshaw'
import moistureLevel2MoistureValue from '../sensors/soil_moisture_sensor.js'


function zeroPadding(n, digits=2) {
    return ('00'+n).slice(-digits);
}


function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = zeroPadding(a.getMinutes());
    var sec = zeroPadding(a.getSeconds());
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;

    return time;
}



export default class ZoneDataContent extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            mode: props.mode ? props.mode : "waiting",
            zone: props.zone,
            data: props.data,
            seriesData: []
        };

        this.getLastReadTime = this.getLastReadTime.bind(this)
        this.getLastValue = this.getLastValue.bind(this)
        this.isIrrigating = this.isIrrigating.bind(this)
        this.renderGraph = this.renderGraph.bind(this)
        this.updateGraph = this.updateGraph.bind(this)
        this.annotateIrrigatingEvent = this.annotateIrrigatingEvent.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        let nextMode = "waiting"
        let seriesData = this.state.seriesData

        if (this.state.data) {
            if (this.state.mode) {
                if (this.state.mode === "waiting") {
                    nextMode = "symbolic"
                } else if (nextProps.mode) {
                    nextMode = nextProps.mode
                } else {
                    nextMode = this.state.mode
                }
            }
        }

        if (nextProps.data) {
            seriesData.push({
                x: parseInt(nextProps.data.timestamp),
                y: parseInt(nextProps.data.sensorsData.value) * 100 / 1023
            })
        }

        this.setState({
            mode: nextMode,
            zone: nextProps.zone,
            data: nextProps.data,
            seriesData: seriesData
        })
    }

    componentWillUpdate(nextProps, nextState) {
        if (this.state.seriesData && this.state.mode === "graph") {
            let threshold = Math.round(moistureLevel2MoistureValue(this.state.zone.min_soil_moisture) * 100 / 1023, 0)

            if (!this.graph) {
                this.graph = this.renderGraph(threshold)
            }  else {
                this.updateGraph()
            }

            if (nextProps.mode === "symbolic") {
                this.graph = null
            }
        }
    }

    renderGraph(threshold) {
        let graph = new Rickshaw.Graph( {
            element: this.refs.graph,
            renderer: 'line',
            min: 0,
            max: 100,
            stroke: true,
            preserve: true,
            width: 350,
            height: 170,
            series:  [{
                color: 'white',
                data: this.state.seriesData,
                name: "Humedad sustrato"
            }],
            padding: {top: 1, left: 1, right: 1, bottom: 1}
        });

        let hoverDetail = new Rickshaw.Graph.HoverDetail( {
	          graph: graph,
	          xFormatter: function(x) {
		            return timeConverter(x)
	          }
        } );

        var formatYAxis = function(n) {
	          var map = {
		            0: '0',
		            50: '50',
		            100: '100'
	          };
            map[threshold] = ''

	          return map[n];
        }

        let yAxis = new Rickshaw.Graph.Axis.Y({
            graph: graph,
            ticksTreatment: 'y-axis',
            element: this.refs.yAxis,
            tickValues: [0, 50, threshold, 100],
            tickFormat: formatYAxis
        });

        yAxis.render();

        this.graphAnnotator = new Rickshaw.Graph.Annotate({
            graph: graph,
            element: this.refs.timeline
        });

        graph.render()

        return graph
    }

    annotateIrrigatingEvent() {
        if (this.isIrrigating()) {
            let time = timeConverter(this.state.data.timestamp)
            this.graphAnnotator.add(this.state.data.timestamp, "Riego ("+ time +")");
            this.graphAnnotator.update();
        }
    }

    updateGraph() {
        this.graph.update()
        this.annotateIrrigatingEvent()
    }

    isIrrigating() {
        return (this.state.data &&
                this.state.data.actuatorsData &&
                this.state.data.actuatorsData.id == this.state.zone.id)
    }

    irrigatingClassName() {
        if (this.isIrrigating()) {
            return "irrigating"
        }
        return ""
    }

    getLastReadTime() {
        if (this.state.data) {
            return timeConverter(this.state.data.timestamp)
        }
        return null
    }

    getLastValue() {
        if (this.state.data) {
            return this.state.data.sensorsData.value
        }
        return null
    }


    render() {
        if (this.state.mode === "waiting") {
            return (
                <div id="content">
                    <div className="loader-area">
                        <div className="loader"></div>
                        <p className="loading">
                            Esperando datos...
                        </p>
                    </div>
                </div>
            )
        } else if (this.state.mode === "symbolic") {
            let lastReadTime = this.getLastReadTime()
            let lastValue = this.getLastValue()
            let irrigatingClassName = this.irrigatingClassName()

            return (
                <div id="content">
                    <div className={irrigatingClassName}></div>
                    <SoilMoistureLevel
                        time={lastReadTime}
                        value={lastValue}
                        zone={this.state.zone}
                    />
                    </div>
            )
        } else if (this.state.mode === "graph") {
            let graphId = "graph" + this.state.zone.id;

            return (
                <div id="content">
                    <div className="graph-content">
                        <div className="y-axis" ref="yAxis"></div>
                        <div className="graph" ref="graph"></div>
                        <div className="timeline" ref="timeline"></div>
                    </div>
                </div>
            )
        }
    }
}
