import * as d3 from 'd3'
import * as React from 'react'
import { Omit } from 'utility-types'
import * as moment from 'moment'
import { cold } from 'react-hot-loader'

import { createStyles } from '@material-ui/styles'

import { FunctionComponentProps, IMyTheme, createSmartFC } from '../common'
import { AbstractD3Chart, IChartProps, useChart } from './AbstractChart'
import RemountOnRetheme from './RemountOnRetheme'
import { LocationStore, ILocationDateExtended } from '../stores/LocationStore'


// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/explicit-function-return-type
const styles = (theme: IMyTheme) => createStyles({
    root: {
        height: '100%',
        width: '100%',
        lineHeight: '0px',
        position: 'relative',
        overflow: 'hidden',
    },

    svg: {
        position: 'absolute',
        top: 0,
        left: 0,
    },

    xAxis: {
    },
    yAxis: {
        '& .tick text': {
            color: 'white',
            fontWeight: 500,
        },
        '& .tick line': {
            opacity: 0.2,
        }
    },
    gridLine: {
    },
    area: {
        fill: "#479cff88",
    },
    line: {
        fill: "none",
        // stroke: "yellow",
        strokeWidth: 2,
        strokeLinejoin: "round",
        strokeLinecap: "round",
    },
    lineDeath: {
        stroke: "red",
    },
    lineRecovered: {
        stroke: "green",
    },
    lineActive: {
        stroke: "magenta",
    },
    lineConfirmed: {
        stroke: "yellow",
    },
    lineActual: {
        strokeWidth: 1,
        stroke: "#479cff",
        strokeDasharray: '10, 5',
    },
    lockdown: {

    },
    path: {
    },
})

const TRANSITION_DURATION = 750

export interface IProps extends IChartProps {
    data: IChartLineDatum[]
    lockdownDate: Date
    dividerOffset?: 'lastDayOfWeek' | 'firstMonthOfYear'
}

// Note: this doesn't friend with HOT nor MOBX.
export default cold(createSmartFC(styles)<IProps>(({children, classes, ...props}) => {
    return <RemountOnRetheme><Chart {...props}/></RemountOnRetheme>
})) /* !============================================================================================================= */

const Chart = createSmartFC(styles)<IProps>(({children, classes, ...props}) => {

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return useChart({classes, ...props}, D3ChartLine)
}) /* !============================================================================================================= */


export type IChartLineDatum = ILocationDateExtended

type PropsFC = FunctionComponentProps<IProps, keyof ReturnType<typeof styles>>

class D3ChartLine extends AbstractD3Chart<PropsFC> {
    public static MARGIN = {top: 20, right: 50, bottom: 30, left: 30}
    protected chart: d3.Selection<Element, {}, null, undefined>
    protected divider: d3.Selection<SVGLineElement, {}, null, undefined>
    protected area: d3.Selection<SVGGElement, {}, null, undefined>
    protected lines: d3.Selection<SVGGElement, {}, null, undefined>
    protected lockdown: d3.Selection<SVGPathElement, {}, null, undefined>
    protected xAxis: d3.Selection<SVGGElement, {}, null, undefined>
    protected yAxis: d3.Selection<SVGGElement, {}, null, undefined>
    protected xScaleOld: d3.ScaleTime<number, number>
    protected yScaleOld: d3.ScaleLinear<number, number>


    public constructor(ref: React.RefObject<HTMLDivElement>, classes: PropsFC['classes']) {
        super(ref, classes)

        const chartWidth = this.width - D3ChartLine.MARGIN.left - D3ChartLine.MARGIN.right
        const chartHeight = this.height - D3ChartLine.MARGIN.top - D3ChartLine.MARGIN.bottom
        this.xScaleOld = d3.scaleTime()
            .domain([LocationStore.START().toDate(), moment().toDate()])
            .range([0, chartWidth])
        this.yScaleOld = d3.scaleLinear()
            .domain([0, 0])
            .range([chartHeight, 0])

        this.chart = this.svg.append<Element>('g')
            .classed(this.classes.svg, true)

        this.xAxis = this.chart.append('g')
            .classed(this.classes.xAxis, true)

        this.yAxis = this.chart.append('g')
            .classed(this.classes.yAxis, true)

        this.divider = this.chart.append('line')

        this.area = this.chart.append('g')
            .classed(this.classes.area, true)

        this.lines = this.chart.append('g')
            .classed(this.classes.line, true)

        this.lockdown = this.chart.append('path')
            .classed(this.classes.lockdown, true)
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-width", 3)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
    }


    public update(props: Omit<PropsFC, 'classes'>) {
        super.update(props)
        const {data, lockdownDate, dividerOffset} = props

        if(process.env.NODE_ENV === 'development') console.log('chart data', data)

        const chartWidth = this.width - D3ChartLine.MARGIN.left - D3ChartLine.MARGIN.right
        const chartHeight = this.height - D3ChartLine.MARGIN.top - D3ChartLine.MARGIN.bottom

        const maxValuePrecise = d3.max(data, (d) => Math.max(d.actualMax, d.cases)) as number
        const scale = Math.pow(10, Math.ceil(Math.log10(maxValuePrecise))) / 10
        const maxValue = Math.ceil(maxValuePrecise / scale) * scale

        const xScale = d3.scaleTime()
            .domain([LocationStore.START().toDate(), moment().add(-1, 'd').toDate()])
            .range([0, chartWidth])

        const yScale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([chartHeight, 0])

        this.chart
            .attr('width', chartWidth)
            .attr('height', chartHeight)
            .attr('transform', `translate(${D3ChartLine.MARGIN.left},${D3ChartLine.MARGIN.top})`)


        const xAxis = d3.axisBottom<Date>(xScale)
            .ticks(d3.timeMonday.every(1 + Math.floor(260 / chartWidth)))
            .tickFormat((date) => moment(date).format('DD MMM'))

        this.xAxis
            .attr('transform', `translate(0, ${chartHeight})`)
            .call((svgXAxis) => {
                svgXAxis.call(xAxis)
                // svgXAxis.select('.domain').remove()
                // svgXAxis.selectAll('.tick line').remove()
            })

        const yAxis = d3.axisRight<number>(yScale)
            // .tickSize(chartWidth)
            .tickArguments([6])
            .tickFormat(this.yTickFormatter(maxValue))

        this.yAxis
            .attr('transform', `translate(${chartWidth}, 0)`)
            .transition().delay(TRANSITION_DURATION).duration(TRANSITION_DURATION)
                .call((svgYAxis) => {
                    svgYAxis.call(yAxis)
                    svgYAxis.selectAll('.tick line').duration(0).attr('x1', -chartWidth)
                    // svgYAxis.selectAll('.tick text')
                })

        const dividerPosition = () => {
            switch(dividerOffset) {
                case('lastDayOfWeek'):    return (chartWidth - chartWidth / 12)
                case('firstMonthOfYear'): return (chartWidth / 12)
                default:                  return 0
            }
        }

        if(dividerOffset) {
            this.divider
                .attr('x1', dividerPosition)
                .attr('x2', dividerPosition)
                .attr('y1', -40)
                .attr('y2', chartHeight + 40)
                .attr('stroke', '#000000')
                .attr('stroke-dasharray', 4)
        }

        interface IData {
            date: Date,
            value: number,
        }
        const linedata = ([
                'cases',
                'deaths',
                'recovered',
                'active',
                'actualMin',
                'actualMax',
            ] as (keyof IChartLineDatum)[]).map((prop) => data.map<IData>((d) => ({
                date: d.date.toDate(),
                value: d[prop] as number,
            })))
        const lineOld = d3.line<IData>()
            .curve(d3.curveBasis)
            .x((d) => this.xScaleOld(d.date))
            .y((d) => this.yScaleOld(d.value))
        const line = d3.line<IData>()
            .curve(d3.curveBasis)
            .x((d) => xScale(d.date))
            .y((d) => yScale(d.value))

        const areaOld = d3.area<IChartLineDatum>()
            .curve(d3.curveBasis)
            .x(d => this.xScaleOld(d.date.toDate()))
            .y0(d => this.yScaleOld(d.actualMin))
            .y1(d => this.yScaleOld(d.actualMax))
        const area = d3.area<IChartLineDatum>()
            .curve(d3.curveBasis)
            .x(d => xScale(d.date.toDate()))
            .y0(d => yScale(d.actualMin))
            .y1(d => yScale(d.actualMax))

        const lockdown = d3.line<IData>()
            .x((d) => xScale(d.date))
            .y((d) => yScale(d.value))
        const lockdownData: IData[] = [
            {date: lockdownDate, value: 0},
            {date: lockdownDate, value: maxValue},
        ]
        this.lockdown
            .attr('stroke', moment(lockdownDate).diff(moment(), 'd') === 0 ? 'none' : 'green')
            .attr("d", d => lockdown(lockdownData));

        const classes = this.classes
        const lineStyles: (keyof typeof classes)[] = [
            'lineConfirmed',
            'lineDeath',
            'lineRecovered',
            'lineActive',
            'lineActual',
            'lineActual',
        ]

        this.area.selectAll("path")
            .data([data])
            .join("path")
                .transition().duration(TRANSITION_DURATION)
                    .attr("d", d => areaOld(d))
                .transition().duration(TRANSITION_DURATION)
                    .attr("d", d => area(d))

        this.lines.selectAll("path")
            .data(linedata)
            .join("path")
                .classed('isActual', (d, i) => lineStyles[i] === 'lineActual')
                .classed(classes['lineConfirmed'], (d, i) => lineStyles[i] === 'lineConfirmed')
                .classed(classes['lineDeath'], (d, i) => lineStyles[i] === 'lineDeath')
                .classed(classes['lineRecovered'], (d, i) => lineStyles[i] === 'lineRecovered')
                .classed(classes['lineActive'], (d, i) => lineStyles[i] === 'lineActive')
                .classed(classes['lineActual'], (d, i) => lineStyles[i] === 'lineActual')
                .transition().duration(TRANSITION_DURATION)
                    .attr("d", lineOld)
                .transition().duration(TRANSITION_DURATION)
                    .attr("d", line)

        const lastDatum = data[data.length - 1]
        if(lastDatum.deaths === 0) {
            this.area
                .transition('opacity')
                .attr('opacity', 0)
            this.lines.selectAll('path.isActual')
                .transition('opacity')
                .attr('opacity', 0)
        } else {
            this.area
                .transition('opacity')
                .attr('opacity', 1)
            this.lines.selectAll('path.isActual')
                .transition('opacity')
                .attr('opacity', 1)
        }


        this.xScaleOld = xScale
        this.yScaleOld = yScale
    }

    private yTickFormatter = (maxValue: number) => (value: number) => {
        if (maxValue < 1e4) return `${d3.format(',.0f')(value)}`
        if (maxValue < 1e5) return `${d3.format(',.1f')(value / 1e3)}K`
        if (maxValue < 1e6) return `${d3.format(',.0f')(value / 1e3)}K`
        if (maxValue < 1e7) return `${d3.format(',.1f')(value / 1e6)}M`
        if (maxValue < 1e9) return `${d3.format(',.0f')(value / 1e6)}M`

        return `${d3.format(',.0f')(value / 1e9)}M`
    }


}
