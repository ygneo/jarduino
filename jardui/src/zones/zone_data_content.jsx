import React from 'react'
import ReactDOM from 'react-dom'
import SoilMoistureLevel from '../widgets/soil_moisture_level.js'
import Rickshaw from 'rickshaw'
import moistureLevel2MoistureValue from '../sensors/soil_moisture_sensor.js'
import ZonesStorage from '../storage.js'


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
            mode: props.mode,
            zone: props.zone,
            data: props.data,
            seriesData: {
                "empty": true,
                "soilMoisture": [],
                "airTemperature": [],
                "airHumidity": [],
                "actuatorsEvents": []
            }
        }

        this.storage = new ZonesStorage

        this.isIrrigating = this.isIrrigating.bind(this)
        this.renderGraph = this.renderGraph.bind(this)
        this.updateGraph = this.updateGraph.bind(this)
        this.getSeriesData = this.getSeriesData.bind(this)
        this.pushtToSeriesData = this.pushToSeriesData.bind(this)
        this.seriesDataAvaliable = this.seriesDataAvaliable.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        let seriesData = this.state.seriesData
        let nextMode = "waiting"

        if (this.state.data || nextProps.data || this.seriesDataAvaliable()) {
            nextMode = "chart"
        }

        if (nextProps.data) {
            this.pushToSeriesData(nextProps.data, seriesData)
        }

        this.setState({
            mode: nextMode,
            zone: nextProps.zone,
            data: nextProps.data,
            seriesData: seriesData
        })
    }

    componentDidMount(nextProps, nextState) {
        let seriesData = this.getSeriesData()

        if (!seriesData.empty) {
            this.setState({
                mode: "chart",
                seriesData: seriesData
            })
        }
    }

    componentDidUpdate(nextProps, nextState) {
        if (nextProps.data || !this.state.seriesData.empty) {
            let threshold = moistureLevel2MoistureValue(this.state.zone.min_soil_moisture)

            if (!this.graph) {
                this.graph = this.renderGraph(threshold)
            }  else {
                this.updateGraph()
            }
        }
    }

    seriesDataAvaliable() {
        return (!this.state.seriesData.empty && this.state.seriesData.soilMoisture.length)
    }

    getSeriesData() {
        let data = this.storage.getZoneData(this.state.zone.id)
        let seriesData = {
            "empty": true,
            "soilMoisture": [],
            "airTemperature": [],
            "airHumidity": [],
            "actuatorsEvents": []
        }
        let this_instance = this

        if (data.length) {
            data.forEach(function (datum) {
                this_instance.pushToSeriesData(datum, seriesData)
            })
            seriesData.empty = false
        }

        return seriesData
    }

    pushToSeriesData(data, seriesData) {
        seriesData['soilMoisture'].push(
            {
                x: parseInt(data.timestamp),
                y: parseInt(data.sensorsData.soilMoisture)
            })
        seriesData['airTemperature'].push(
            {
                x: parseInt(data.timestamp),
                y: parseInt(data.sensorsData.airTemperature)
            }
        )
        seriesData['airHumidity'].push(
            {
                x: parseInt(data.timestamp),
                y: parseInt(data.sensorsData.airHumidity)
            })

        if (data.actuatorsData.length) {
            let eventDuration = parseInt(data.actuatorsData[0].value) / 1000
            let startTimestamp = parseInt(data.timestamp)
            let endTimestamp = startTimestamp + eventDuration

            seriesData['actuatorsEvents'].push(
                {
                    x: startTimestamp,
                    y: 100
                },
                {
                    x: endTimestamp,
                    y: 0
                },

            )
        }
    }

    renderGraph(threshold) {
        let graph = new Rickshaw.Graph( {
            element: this.refs.graph,
            min: 0,
            max: 100,
            renderer: 'multi',
            stroke: true,
            preserve: true,
            width: 350,
            height: 170,
            series:  [
                {
                    color: 'brown',
                    data: this.state.seriesData.soilMoisture,
                    name: "Humedad sustrato",
                    renderer: 'line'
                },
                {
                    data: this.state.seriesData.airTemperature,
                    name: "Temperatura del aire",
                    color: 'yellow',
                    renderer: 'line'
                },
                {
                    data: this.state.seriesData.airHumidity,
                    name: "Humedad del aire",
                    color: 'green',
                    renderer: 'line'
                },
                {
                    data: this.state.seriesData.actuatorsEvents,
                    name: "Riego",
                    color: 'blue',
                    renderer: 'bar'
                }
            ],
            padding: {top: 1, left: 1, right: 1, bottom: 1}
        });

        let hoverDetail = new Rickshaw.Graph.HoverDetail( {
	          graph: graph,
	          xFormatter: function(x) {
		            return timeConverter(x)
	          },
            yFormatter: function(y) {
                if (y<100) {
                    return y
                }
                return null
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

    updateGraph() {
        this.graph.update()

        if (this.isIrrigating()) {
            let time = timeConverter(this.state.data.timestamp)
            this.graphAnnotator.add(this.state.data.timestamp, "Riego ("+ time +")");
            this.graphAnnotator.update();
        }
    }

    isIrrigating() {
        return (this.state.data &&
                this.state.data.actuatorsData &&
                this.state.data.actuatorsData.length)
    }

    irrigatingClassName() {
        if (this.isIrrigating()) {
            return "irrigating"
        }
        return ""
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
        } else {
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
