import React from 'react'
import ReactDOM from 'react-dom'
import jQuery from 'jquery'
import jQueryUi from 'jquery-ui'

import Rickshaw from 'rickshaw'
import ZonesStorage from '../../storage.js'
import timeConverter from '../../timeConverter.js'

function zeroPadding(n, digits=2) {
    return ('00'+n).slice(-digits);
}


let series = [
    {
        color: '#99754D',
        name: "Humedad sustrato",
        renderer: 'line',
        units: "%"
    },
    {
        color: '#17A1E6',
        name: "Temperatura aire",
        renderer: 'line',
        units: "ºC"
    },
    {
        color: '#FFC300',
        name: "Humedad aire",
        renderer: 'line',
        units: "%"
    },
    {
        color: 'blue',
        name: "Eventos de riego",
        renderer: 'bar',
        noHoverDetail: true
    }
]

export default class HistoricModal extends React.Component {

    constructor(props) {
        super(props);
        this.storage = new ZonesStorage

        let seriesData = this.getSeriesData(props.zone.id)

        this.state = {
            "zone": props.zone,
            "seriesData": seriesData,
            "opened": props.opened
        }

        this.getSeriesData = this.getSeriesData.bind(this)
        this.pushtToSeriesData = this.pushToSeriesData.bind(this)
        this.renderAxis = this.renderAxis.bind(this)
        this.handleCloseModal = this.handleCloseModal.bind(this)
    }

    handleCloseModal() {
        this.props.onClose()
    }

    getSeriesData(zoneId) {
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

    componentWillReceiveProps(nextProps) {
        this.setState({
            "opened": nextProps.opened
        })
    }

    componentDidMount() {
        series[0].data = this.state.seriesData.soilMoisture
        series[1].data = this.state.seriesData.airTemperature
        series[2].data = this.state.seriesData.airHumidity
        series[3].data = this.state.seriesData.actuatorsEvents

        let graph = new Rickshaw.Graph( {
	          element: this.refs.chart,
            min: 0,
            max: 100,
	          width: 1024,
	          height: 580,
	          renderer: 'multi',
	          series: series
	      })

        graph.render()

        this.setGraphHover(graph)
        this.renderAxis(graph)
//        this.renderLegends(graph)
    }

    render () {
        let className = "modal hide"

        if (this.state.opened) {
            className = "modal show"
        }

        return (
            <div id="historicModal" className={className}>
                <div className="modal-header">
                    <span className="title">Histórico</span>
                    <span className="close" onClick={this.handleCloseModal}>&times;</span>
                </div>
                <div className="modal-content">
                    <h3>{this.state.zone.name}</h3>
                    <div id="chart_container">
                        <div className="y-axis" ref="yAxis"></div>
		                    <div id="chart" ref="chart"></div>
		                    <div id="timeline"></div>
		                    <div id="preview" ref="preview"></div>
	                  </div>
                    <div id="panel">
                        <div id="legend" ref="legend"></div>
                        <div id="smoother" ref="smoother"></div>
                    </div>
                </div>
            </div>
        )
    }
}
