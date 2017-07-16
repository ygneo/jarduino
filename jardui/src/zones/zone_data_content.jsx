import React from 'react'
import ReactDOM from 'react-dom'
import SoilMoistureLevel from '../widgets/soil_moisture_level.js'
import Rickshaw from 'rickshaw'
import moistureLevel2MoistureValue from '../sensors/soil_moisture_sensor.js'
import ZonesStorage from '../storage.js'
import timeConverter from '../timeConverter.js'


function zeroPadding(n, digits=2) {
    return ('00'+n).slice(-digits);
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
            let threshold = this.state.zone.min_soil_moisture

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
                }
            )
        }
    }

    renderGraph(threshold) {
        let series = [
            {
                color: '#99754D',
                name: "Humedad sustrato",
                renderer: 'line',
                units: "%"
            },
            {
                color: '#FFC300',
                name: "Temperatura aire",
                renderer: 'line',
                units: "ºC"
            },
            {
                color: '#17A1E6',
                name: "Humedad aire",
                renderer: 'line',
                units: "%"
            }
        ]

        var tv = 1500;

        // instantiate our graph!
        var graph = new Rickshaw.Graph( {
	          element: this.refs.graph,
            min: 0,
            max: 100,
	          width: 320,
	          height: 170,
	          renderer: 'multi',
	          series: new Rickshaw.Series.FixedDuration(series, undefined, {
		            timeInterval: tv,
		            maxDataPoints: 100,
		            timeBase: new Date().getTime() / 1000
	          }) 
        } );

        graph.render();

        let i = 0;
        let this_instance = this;

        let iv = setInterval( function() {
            let seriesData = this_instance.state.seriesData
            let l = this_instance.state.seriesData.soilMoisture.length - 1

            let lastSoilMoistureValue = seriesData.soilMoisture[l].y
            let lastAirTempValue = seriesData.airTemperature[l].y
            let lastAirHumidityValue = seriesData.airHumidity[l].y

	          let data = {
                "Humedad sustrato": lastSoilMoistureValue,
                "Humedad aire": lastAirHumidityValue,
                "Temperatura aire": lastAirTempValue
            }

	          graph.series.addData(data)
	          graph.render()
        }, tv );

        let Hover = Rickshaw.Class.create(Rickshaw.Graph.HoverDetail, {
            render: function($super, args) {
                // get the current point we are dealing with
                var point = args.points.filter( function(p) {
                    return p.active }
                ).shift();

                if (point.value.y === null) return;

                // check if the series we are dealing with has the "noHoverDetail"
                // attribute set to true. If so, we don't want to render this
                // hover detail item, if not call the original render method as
                // normal
                if (point.series.noHoverDetail !== true) {
                    $super(args);
                }

                if (point.series.units) {
                    let units = point.series.units
                    this.yFormatter =  function(y) {
                        return y + units
	                  }
                }
            }
        });

        let hoverDetail = new Hover( {
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

        var xAxis = new Rickshaw.Graph.Axis.X({
            graph: graph,
            element: this.refs.xAxis,
            tickFormat: function (x) {
                let d = new Date(x * 1000)
                return zeroPadding(d.getUTCHours()) + ":" + zeroPadding(d.getUTCMinutes()) + ":" + zeroPadding(d.getUTCSeconds())
            },
            orientation: 'bottom',
            pixelsPerTick: 75
        });

        xAxis.render();

        /* this.graphAnnotator = new Rickshaw.Graph.Annotate({
         *     graph: graph,
         *     element: this.refs.timeline
         * });

         * graph.render()
         */
        return graph
    }

    updateGraph() {
        this.graph.update()

        if (this.isIrrigating()) {
            let time = timeConverter(this.state.data.timestamp)
            //            this.graphAnnotator.add(this.state.data.timestamp, "Riego ("+ time +")");
            //          this.graphAnnotator.update();
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
                        <div className="x-axis" ref="xAxis"></div>
                        <div className="timeline" ref="timeline"></div>
                    </div>
                </div>
            )
        }
    }
}
