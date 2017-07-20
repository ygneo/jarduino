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
            mode: props.mode || "chart",
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
        this.updateGraphData = this.updateGraphData.bind(this)
        this.getSeriesData = this.getSeriesData.bind(this)
        this.pushtToSeriesData = this.pushToSeriesData.bind(this)
        this.seriesDataAvaliable = this.seriesDataAvaliable.bind(this)
        this.hasNewData = this.hasNewData.bind(this)
        this.renderSeriesData = this.renderSeriesData.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        let seriesData = this.getSeriesData()
        let nextMode = "chart"

        if (seriesData.empty) {
            nextMode = "waiting" // maybe use timeout to change to waiting
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

    componentDidUpdate(nextProps, nextState) {
        if (this.state.seriesData.soilMoisture.length > 2) {
            let threshold = this.state.zone.min_soil_moisture

            if (!this.graph) {
                this.graph = this.renderGraph(threshold)
                this.renderSeriesData()
            } else {
                if (this.hasNewData(nextState)) {
                    this.updateGraph()
                }
            }
        }
    }

    renderSeriesData() {
        let seriesData = this.state.seriesData
        let l = seriesData.soilMoisture.length
        let actuatorsEvents = []

        for (let i=0; i<l; i++) {
            let values = {
                soilMoisture: seriesData.soilMoisture[i].y,
                airTemperature: seriesData.airTemperature[i].y,
                airHumidity: seriesData.airHumidity[i].y,
                actuatorsEvents: seriesData.actuatorsEvents || []
            }
            this.updateGraphData(seriesData.soilMoisture[i].x, values)
        }
    }


    hasNewData(nextState) {
        let lastTimeStamp;

        if (this.state.data) {
            if (nextState.data) {
                if (this.state.data.timestamp >= nextState.data.timestamp) {
                    return true
                }
            }
            return false
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
            },
            {
                color: 'blue',
                name: "irrEvent",
                renderer: 'bar',
                noHoverDetail: true
            }
        ]

        let tv = 1000

        let graph = new Rickshaw.Graph( {
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
        } )

        graph.render()

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
		            return timeConverter(x, false)
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
                return zeroPadding(d.getHours()) + ":" + zeroPadding(d.getMinutes()) + ":" + zeroPadding(d.getSeconds())
            },
            orientation: 'bottom',
            pixelsPerTick: 75
        });

        xAxis.render();


        /*        this.graphAnnotator = new Rickshaw.Graph.Annotate({
           graph: graph,
           element: this.refs.timeline
           });
           this.graphAnnotator.add(new Date() / 1000, "Riego")

           if (this.isIrrigating()) {
           console.log("RIEGO")
           this.graphAnnotator.add(new Date() / 1000, "Riego");
           this.graphAnnotator.update();
           }
         */
        return graph
    }

    updateGraphData(timestamp, values) {
        let irrEvent = 0
        let actuatorsEvents = values.actuatorsEvents
        let eventsCount = actuatorsEvents.length

/*        if (actuatorsEvents && eventsCount) {
            console.log("UP")
            console.log("actuator TS")
            console.log(actuatorsEvents[eventsCount - 1].x)
            console.log("TS")
            console.log(timestamp)

            if (actuatorsEvents[eventsCount - 1].x <= timestamp) {
                console.log("IRR EVENT")
                irrEvent = 100
            }
        }
        */
        if (this.isIrrigating()) {
            irrEvent = 100
        }

	      let data = {
            "Humedad sustrato": values.soilMoisture,
            "Humedad aire": values.airTemperature,
            "Temperatura aire": values.airHumidity,
            "irrEvent": irrEvent
        }

	      this.graph.series.addData(data)
	      this.graph.render()
    }

    updateGraph() {
        let seriesData = this.state.seriesData
        let l = this.state.seriesData.soilMoisture.length - 1

        let values = {
            soilMoisture: seriesData.soilMoisture[l].y,
            airTemperature: seriesData.airTemperature[l].y,
            airHumidity: seriesData.airHumidity[l].y,
            actuatorsEvents: seriesData.actuatorsEvents || []
        }

        this.updateGraphData(seriesData.soilMoisture[l].x, values)
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
                            Graficando datos...
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
