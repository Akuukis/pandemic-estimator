import * as d3 from 'd3'
import * as React from 'react'
import { Class } from 'utility-types'

import { FunctionComponentProps } from '../common'


export interface IChartProps {
    // data: unknown[]
}

// tslint:disable-next-line: min-class-cohesion
export abstract class AbstractD3Chart<T extends FunctionComponentProps<IChartProps>> {
    protected refCurrent: HTMLDivElement
    protected get height(): number { return this.refCurrent.clientHeight}
    protected get width(): number { return this.refCurrent.clientWidth}
    protected readonly classes: T['classes']
    protected readonly disposers: Array<() => void> = []
    protected lastProps: null | Pick<T, Exclude<keyof T, 'classes'>>
    protected readonly svg: d3.Selection<Element, {}, null, undefined>

    public constructor(ref: React.RefObject<HTMLDivElement>, classes: T['classes']) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.refCurrent = ref.current!
        this.classes = classes
        this.lastProps = null

        this.svg = d3.select<Element, {}>(this.refCurrent).append<Element>('svg')
            .classed(this.classes.svg, true)

        window.addEventListener('resize', this.redraw)
        this.disposers.push(() => window.removeEventListener('resize', this.redraw))
    }

    public deconstructor(): void {
        d3.select(this.refCurrent).selectAll('*').remove()
        this.disposers.forEach((disposer) => disposer())
    }

    public update(props: Pick<T, Exclude<keyof T, 'classes'>>): void {
        this.lastProps = props
        this.svg
            .attr('width', this.width)
            .attr('height', this.height)
    }

    /**
     * For use in various listeners only.
     */
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    protected readonly redraw = (): void => this.update(this.lastProps!)
}

export const useChart = <T extends FunctionComponentProps<IChartProps>>({classes, ...props}: T, Chart: Class<AbstractD3Chart<T>>): JSX.Element => {
    const ref = React.useRef()
    const [chart, setChart] = React.useState<AbstractD3Chart<T> | null>(null)

    // At first time only, this will create & update chart.
    React.useEffect(() => {
        const constructedChart = new Chart(ref, classes)
        setChart(constructedChart)

        return (): void => {
            constructedChart.deconstructor()
            setChart(null)
        }
    }, [])

    // At re-render, update chart.
    React.useEffect(() => {
        if(chart) chart.update(props)
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <div className={classes.root} ref={ref as any}/>
}
