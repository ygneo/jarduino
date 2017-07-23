import React from 'react'
import ReactDOM from 'react-dom'
import jQuery from 'jquery'
import jQueryUi from 'jquery-ui'

import Rickshaw from 'rickshaw'
import ZonesStorage from '../../storage.js'
import timeConverter from '../../timeConverter.js'
import ReactWidgets from 'react-widgets'

const DateTimePicker = ReactWidgets.DateTimePicker;

function zeroPadding(n, digits=2) {
    return ('00'+n).slice(-digits);
}


export default class HistoricModal extends React.Component {

    constructor(props) {
        super(props);
        this.storage = new ZonesStorage

        let zoneId = props.zone.id
        let data = this.storage.getZoneData(zoneId)
        let last = data.length - 1
        let startTimeStamp = data[0].timestamp
        let endTimeStamp = data[last].timestamp
        let seriesData = this.getSeriesData(zoneId, startTimeStamp, endTimeStamp)

        this.state = {
            "zone": props.zone,
            "seriesData": seriesData,
            "opened": props.opened,
            "startTimeStamp": startTimeStamp,
            "endTimeStamp": endTimeStamp
        }

        this.getSeriesData = this.getSeriesData.bind(this)
        this.pushtToSeriesData = this.pushToSeriesData.bind(this)
        this.renderAxis = this.renderAxis.bind(this)
        this.handleCloseModal = this.handleCloseModal.bind(this)
        this.renderGraph = this.renderGraph.bind(this)
    
        this.handleStartDateChange = this.handleStartDateChange.bind(this)
        this.handleEndDateChange = this.handleEndDateChange.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        let seriesData = this.getSeriesData(this.state.zone.id)

        this.setState({
            "opened": nextProps.opened,
            "seriesData": seriesData
        })
    }

    componentDidMount() {
        this.renderGraph()
    }

    componentDidUpdate() {
        console.log("UPDATE")
        console.log(new Date(this.state.startTimeStamp * 1000))
        console.log(new Date(this.state.endTimeStamp * 1000))

        if (this.graph) {
            let seriesData = this.getSeriesData(this.state.zone.id,
                                                this.state.startTimeStamp,
                                                this.state.endTimeStamp)

            this.graph.series[0].data = []
            this.graph.series[1].data = []
            this.graph.series[2].data = []
            this.graph.series[3].data = []

            this.graph.series[0].data = seriesData.soilMoisture
            this.graph.series[1].data = seriesData.airTemperature
            this.graph.series[2].data = seriesData.airHumidity
            this.graph.series[3].data = seriesData.actuatorsEvents

            this.graph.update()
        }
    }

    renderGraph() {
        let graph = new Rickshaw.Graph( {
	          element: this.refs.chart,
            min: 0,
            max: 100,
	          width: 950,
	          height: 580,
	          renderer: 'multi',
	          series: [
                {
                    color: '#99754D',
                    name: "Humedad sustrato",
                    renderer: 'line',
                    units: "%",
                    data: this.state.seriesData.soilMoisture
                },
                {
                    color: '#17A1E6',
                    name: "Temperatura aire",
                    renderer: 'line',
                    units: "ºC",
                    data: this.state.seriesData.airTemperature
                },
                {
                    color: '#FFC300',
                    name: "Humedad aire",
                    renderer: 'line',
                    units: "%",
                    data: this.state.seriesData.airHumidity
                },
                {
                    color: 'blue',
                    name: "Eventos de riego",
                    renderer: 'bar',
                    noHoverDetail: true,
                    data: this.state.seriesData.actuatorsEvents
                }
            ]
	      })

        graph.render()

        this.setGraphHover(graph)
        this.renderAxis(graph)

        this.graph = graph
    }

    handleCloseModal() {
        this.props.onClose()
    }

    getSeriesData(zoneId, startTimeStamp, endTimeStamp) {
        let data = this.storage.getZoneData(zoneId)

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
                if (datum.timestamp >= startTimeStamp && datum.timestamp <= endTimeStamp) {
                    this_instance.pushToSeriesData(datum, seriesData)
                }
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
            let startTimestamp = parseInt(data.actuatorsData[0].timestamp)
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

    setGraphHover(graph) {
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
		            return timeConverter(x, true)
	          }
        })
    }

    renderAxis(graph) {
        let thresholds = []

        for (let thName in this.state.zone.thresholds) {
            if (this.state.zone.thresholds[thName].enabled) {
                thresholds.push(this.state.zone.thresholds[thName])
            }
        }

        let formatYAxis = function(n) {
	          var map = {
		            20: '20',
		            40: '40',
		            60: '60',
                80: '80'
	          }
            for (let th in thresholds) {
                let threshold = thresholds[th]
                map[threshold.value] = threshold.abrName
            }

	          return map[n]
        }

        let tickValues = [20, 40, 60, 80]
        for (let th in thresholds) {
            let threshold = thresholds[th]
            tickValues.push(threshold.value)
        }
        tickValues = tickValues.sort()


        let yAxis = new Rickshaw.Graph.Axis.Y({
            graph: graph,
            ticksTreatment: 'y-axis',
            tickValues: tickValues,
            tickFormat: formatYAxis
        });

        yAxis.render();

        var xAxis = new Rickshaw.Graph.Axis.Time( {
	          graph: graph,
            ticksTreatment: "glow"
        } )

        xAxis.render();
    }

    renderLegends(graph) {
        let legend = new Rickshaw.Graph.Legend( {
	          graph: graph,
	          element: this.refs.legend
        } )
    }

    handleStartDateChange(startDate) {
        let sDate = new Date(startDate)
        let timestamp = sDate.getTime() / 1000

        sDate.setHours(startDate.getHours() + 2)
        timestamp = sDate.getTime() / 1000

        this.setState({
            "startTimeStamp": timestamp
        })
    }

    handleEndDateChange(endDate) {
        let date = new Date(endDate)
        let timestamp = date.getTime() / 1000

        date.setHours(startDate.getHours() + 2)
        timestamp = date.getTime() / 1000

        this.setState({
            "endTimeStamp": timestamp
        })
    }

    render () {
        let className = "modal hide"
        let zone = this.state.zone

        if (this.state.opened) {
            className = "modal show"
        }

        let thClassName = {
            soilMoisture: zone.thresholds.soilMoisture.enabled ? "show" : "hide",
            airHumidity: zone.thresholds.airHumidity.enabled ? "show" : "hide",
            airTemperature: zone.thresholds.airTemperature.enabled ? "show" : "hide"
        }

        let startDate = new Date(this.state.startTimeStamp * 1000)
        let endDate = new Date(this.state.endTimeStamp * 1000)
        startDate.setHours(startDate.getHours() - 2)
        endDate.setHours(endDate.getHours() - 2)

        return (
            <div id="historicModal" className={className}>
                <div className="modal-header">
                    <span className="title">Histórico</span>
                    <span className="close" onClick={this.handleCloseModal}>&times;</span>
                </div>
                <div className="modal-content">
                    <h3>{this.state.zone.name}</h3>
                    <div id="filter">
                        Desde
                        <DateTimePicker
                            defaultValue={startDate}
                            onChange={this.handleStartDateChange}
                            step={5}
                        />
                        Hasta
                        <DateTimePicker
                            defaultValue={endDate}
                            onChange={this.handleEndDateChange}
                            step={5}
                        />
                    </div>
                    <div id="chart_container">
                        <div className="y-axis" ref="yAxis"></div>
		                    <div id="chart" ref="chart"></div>
		                    <div id="timeline"></div>
		                    <div id="preview" ref="preview"></div>
	                  </div>
                    <div id="panel">
                        <div className="thrContainer">
                            <div className="lineSoilMoisture"></div><div className="thr">Humedad del sustrato</div>
                        </div>
                        <div className="thrContainer">
                            <div className="lineAirHumidity"></div><div className="thr">Humedad del aire</div>
                        </div>
                        <div className="thrContainer">
                            <div className="lineAirTemperature"></div><div className="thr">Temperatura del aire</div>
                        </div>
                        <div className={`thrContainer ${thClassName.soilMoisture}`}>
                            <div className="thrLine w3-border-blue"></div><div className="thr">Umbral de riego (h) <span>&lt; {this.state.zone.thresholds.soilMoisture.value}%</span></div>
                        </div>
                        <div className={`thrContainer ${thClassName.airHumidity}`}>
                            <div className="thrLine w3-border-red"></div><div className="thr">Umbral de riego (hr) <span>&lt; {this.state.zone.thresholds.airHumidity.value}%</span></div>
                        </div>

                        <div className={`thrContainer ${thClassName.airTemperature}`}>
                            <div className="thrLine w3-border-black"></div><div className="thr">Umbral de riego (t) <span>&lt; {this.state.zone.thresholds.airTemperature.value}%</span></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
