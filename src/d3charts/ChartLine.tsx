import * as d3 from 'd3'
import * as moment from 'moment'
import * as React from 'react'
import { cold } from 'react-hot-loader'
import { Omit } from 'utility-types'

import { createStyles } from '@material-ui/styles'

import { createSmartFC, FunctionComponentProps, IMyTheme } from '../common'
import { countryTitle, ILocation, ILocationDateExtended, LocationStore } from '../stores/LocationStore'
import { AbstractD3Chart, IChartProps, useChart } from './AbstractChart'
import RemountOnRetheme from './RemountOnRetheme'


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
        backgroundColor: theme.palette.background.paper,
        position: 'absolute',
        top: 0,
        left: 0,
    },

    xAxis: {
        '& .tick text': {
            fill: theme.palette.primary.main,
            fontWeight: 500,
        },
    },
    yAxis: {
        '& .tick text': {
            fill: theme.palette.primary.main,
            fontWeight: 500,
        },
        '& .tick line': {
            opacity: 0.2,
        },
        '& path': {
            opacity: 0,
        },
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
    lineHidden: {
        strokeWidth: 0,
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
    legend: {
        backgroundColor: theme.palette.background.paper,
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        fontFamily: theme.fontFamily.default,
        fill: theme.palette.primary.dark,
        textAnchor: 'middle',
        textDecoration: 'underline',
    },
    location: {
        fontSize: '1rem',
        fontWeight: 700,
        fontFamily: theme.fontFamily.default,
        fill: theme.palette.primary.dark,
    },
    arguments: {
    },
    credits: {
        fontSize: '0.625rem',
        fontFamily: theme.fontFamily.mono,
        fill: theme.palette.primary.dark,
    },
})

const TRANSITION_DURATION = 750

export interface IProps extends IChartProps {
    lockdownDate: Date
    location: ILocation<ILocationDateExtended>
}

// Note: this doesn't friend with HOT nor MOBX.
export default cold(createSmartFC(styles)<IProps>(({children, classes, ...props}) => {
    return <RemountOnRetheme><Chart {...props}/></RemountOnRetheme>
})) /* !============================================================================================================= */

const Chart = createSmartFC(styles)<IProps>(({children, classes, ...props}) => {

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return useChart({classes, ...props}, D3ChartLine)
}) /* !============================================================================================================= */


type PropsFC = FunctionComponentProps<IProps, keyof ReturnType<typeof styles>>

class D3ChartLine extends AbstractD3Chart<PropsFC> {
    public static MARGIN = {top: 20, right: 50, bottom: 50, left: 30}
    protected title: d3.Selection<SVGTextElement, {}, null, undefined>
    protected locations: d3.Selection<SVGGElement, {}, null, undefined>
    protected arguments: d3.Selection<SVGGElement, {}, null, undefined>
    protected chart: d3.Selection<Element, {}, null, undefined>
    protected credits: d3.Selection<SVGTextElement, {}, null, undefined>
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

        const header = this.svg.append<Element>('g')
            .classed(this.classes.legend, true)
            .attr('transform', `translate(${D3ChartLine.MARGIN.left},${D3ChartLine.MARGIN.top})`)

        this.title = header.append('text')
            .classed(this.classes.title, true)

        this.locations = header.append('g')
            .classed(this.classes.location, true)

        this.arguments = header.append('g')
            .classed(this.classes.arguments, true)

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

        this.credits = this.svg.append('g').append('text')
            .classed(this.classes.credits, true)
    }


    public update(props: Omit<PropsFC, 'classes'>) {
        super.update(props)
        const {location, lockdownDate} = props
        const data = location.dates
        const credits = location.url

        if(process.env.NODE_ENV === 'development') console.log('chart data', data)

        const chartWidth = this.width - D3ChartLine.MARGIN.left - D3ChartLine.MARGIN.right
        const chartHeight = this.height - D3ChartLine.MARGIN.top - D3ChartLine.MARGIN.bottom

        const maxValuePrecise = d3.max(data, (d) => Math.max(d.actualMax, d.confirmed)) as number
        const scale = Math.pow(10, Math.ceil(Math.log10(maxValuePrecise))) / 10
        const maxValue = Math.ceil(maxValuePrecise / scale) * scale

        const xScale = d3.scaleTime()
            .domain([LocationStore.START().toDate(), moment().add(-1, 'd').toDate()])
            .range([0, chartWidth])

        const yScale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([chartHeight, 0])

        this.title
            .text('Pandemic-estimator.net')
            .attr('transform', `translate(${chartWidth/2}, ${1.5*16})`)

        const locations = [
                location.country ? `Country: ${countryTitle(location.country)}` : undefined,
                location.state ? `State: ${location.state}` : undefined,
                location.county ? `County: ${location.county}` : undefined,
                location.city ? `City: ${location.city}` : undefined,
            ].filter((d): d is string => d !== undefined)

        this.locations.selectAll('text')
            .data(locations)
            .join('text')
                .text((d) => d)
                .attr('transform', (d, i) => `translate(0, ${(4+i*1.2)*16})`)

        this.chart
            .attr('width', chartWidth)
            .attr('height', chartHeight)
            .attr('transform', `translate(${D3ChartLine.MARGIN.left},${D3ChartLine.MARGIN.top})`)

        const xTickFormatter = this.XTickFormatter(lockdownDate)
        const xAxis = d3.axisBottom<Date>(xScale)
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .ticks(d3.timeDay.every(1)!)
            .tickSize(0)  // Will set to 3 or 6 later.
            .tickPadding(6+3)
            .tickFormat(xTickFormatter)

        this.xAxis
            .attr('transform', `translate(0, ${chartHeight})`)
            .call((svgXAxis) => {
                svgXAxis.call(xAxis)
                svgXAxis.selectAll('.tick line')
                    .attr('y1', 0)
                    .attr('y2', (d) => xTickFormatter(d as Date) === '' ? 3 : 6)
            })

        const yAxis = d3.axisRight<number>(yScale)
            // .tickSize(chartWidth)
            .tickArguments([6])
            .tickFormat(this.YTickFormatter(maxValue))

        this.yAxis
            .attr('transform', `translate(${chartWidth - 6}, 0)`)
            .transition().delay(TRANSITION_DURATION).duration(TRANSITION_DURATION)
                .call((svgYAxis) => {
                    svgYAxis.call(yAxis)
                    svgYAxis.selectAll('.tick line').duration(0)
                        .attr('x1', -chartWidth - D3ChartLine.MARGIN.left)
                        .attr('x2', D3ChartLine.MARGIN.right)
                    svgYAxis.selectAll('.tick text')
                        .attr('dy', '-0.25em')

                    // svgYAxis.selectAll('.tick text')
                })

        interface IData {
            date: Date,
            value: number,
        }
        const linedata = ([
                'actualMin',
                'actualMax',
                'active',
                'recovered',
                'confirmed',
                'deaths',
            ] as (keyof ILocationDateExtended)[]).map((prop) => data.map<IData>((d) => ({
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

        const areaOld = d3.area<ILocationDateExtended>()
            .curve(d3.curveBasis)
            .x(d => this.xScaleOld(d.date.toDate()))
            .y0(d => this.yScaleOld(d.actualMin))
            .y1(d => this.yScaleOld(d.actualMax))
        const area = d3.area<ILocationDateExtended>()
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
            'lineActual',
            'lineActual',
            linedata[2][linedata[2].length-1].value > 0 ? 'lineActive' : 'lineHidden',
            linedata[3][linedata[3].length-1].value > 0 ? 'lineRecovered' : 'lineHidden',
            'lineConfirmed',
            'lineDeath',
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

        this.credits
            .attr('transform', `translate(${D3ChartLine.MARGIN.left}, ${this.height - D3ChartLine.MARGIN.bottom/4})`)
            .text(`source: ${credits}`)


        this.xScaleOld = xScale
        this.yScaleOld = yScale
    }

    private XTickFormatter = (lockdownDate: Date) => (date: Date) => {
        const mom = moment(date)
        return (mom.weekday() === 0 || mom.diff(moment(), 'd') === -1) ? mom.format('D MMM') : ''
    }

    private YTickFormatter = (maxValue: number) => (value: number) => {
        if (maxValue < 1e4) return `${d3.format(',.0f')(value)}`
        if (maxValue < 1e5) return `${d3.format(',.1f')(value / 1e3)}K`
        if (maxValue < 1e6) return `${d3.format(',.0f')(value / 1e3)}K`
        if (maxValue < 1e7) return `${d3.format(',.1f')(value / 1e6)}M`
        if (maxValue < 1e9) return `${d3.format(',.0f')(value / 1e6)}M`

        return `${d3.format(',.0f')(value / 1e9)}M`
    }


}
