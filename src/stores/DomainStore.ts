import { action, computed, observable, runInAction } from 'mobx'

import { PiwikStore } from './PiwikStore'
import * as moment from 'moment'


const WORLD = 'World'

export enum CASE_INDEX {
    DATE = 0,
    CONFIRMED = 1,
    DEATHS = 2,
    RECOVERED = 3,
    ACTIVE = 4,
    ACTUAL_MIN = 5,
    ACTUAL_MAX = 6,
}
/**
 * A tuple of values in order:
 * - date YYYY-MM-DD
 * - Recovered
 * - Deaths
 * - Confirmed
 */
export type IRawCase = [string, number, number, number]
/**
 * A tuple of values in order:
 * - date YYYY-MM-DD
 * - Recovered
 * - Deaths
 * - Confirmed
 * - Actual (min)
 * - Actual (max)
 */
export type ICase = [string, number, number, number, number, number, number]

/**
 * Cases are daily data series that starts on `2020-01-01`
 */
export interface IRaw<TCase extends IRawCase | ICase = IRawCase> {
    country: string  // cca3
    county: string | null
    subdivision: string | null
    cases: TCase[]
}

export interface IModelArgs {
    deathRate: number,
    daysToDeath: number,
    daysToDouble: number,
}

export interface IModelArgsExpanded {
    lockdown: Date,
    deathRate: [number, number],
    daysToDeath: [number, number],
    daysToDouble: [number, number],
    daysToDoubleAfter: [number, number],
}

/**
 * Model
 */
const modelByTomasPueyo = (deaths: number, args: IModelArgs): number => {
    return deaths / args.deathRate * Math.pow(2, args.daysToDeath / args.daysToDouble)
}

/**
 * Return running average daily death delta as follows:
 * - most of the data series: average of 7 days (three days before and after)
 * - 3nd first and last data serie: average of 5 days (two days before and after)
 * - 2nd first and last data serie: average of 3 days (one day before and after)
 * - first and last data serie: no average.
 */
const smoothDeaths = (i: number, array: IRawCase[]): number => {
    if(i === 0) return array[i][CASE_INDEX.DEATHS]

    const deaths = [
        (i > 3 && i+3 < array.length) ? array[i-4][CASE_INDEX.DEATHS] : undefined,
        (i > 2 && i+2 < array.length) ? array[i-3][CASE_INDEX.DEATHS] : undefined,
        (i > 1 && i+1 < array.length) ? array[i-2][CASE_INDEX.DEATHS] : undefined,
        array[i-1][CASE_INDEX.DEATHS],
        array[i][CASE_INDEX.DEATHS],
        (i > 1 && i+1 < array.length) ? array[i+1][CASE_INDEX.DEATHS] : undefined,
        (i > 2 && i+2 < array.length) ? array[i+2][CASE_INDEX.DEATHS] : undefined,
        (i > 3 && i+3 < array.length) ? array[i+3][CASE_INDEX.DEATHS] : undefined,
    ].filter((death): death is number => death !== undefined)
    const deathsDelta = (deaths[deaths.length - 1] - deaths[0]) / (deaths.length - 1)
    return deathsDelta
}

/**
 * Data pipeline:
 * - **domainsRaw**: equals original dataset.
 * - **domains**: normalized to equal length.
 * - **dataRaw**: merged selected domains into one.
 * - **data**: add active and estimated actual cases.
 */
export class DomainStore {
    public static START = (): moment.Moment => moment('2020-02-01')
    public static readonly EXTREME_ARGS: IModelArgsExpanded = {
        lockdown: moment().toDate(),
        deathRate: [0.005, 0.05],
        daysToDeath: [13, 23],
        daysToDouble: [2.5, 10],
        daysToDoubleAfter: [5, 30],
    }
    public static readonly DEFAULT_ARGS: IModelArgsExpanded = {
        lockdown: moment().toDate(),
        deathRate: [0.01, 0.04],
        daysToDeath: [16, 19],
        daysToDouble: [6, 7],
        daysToDoubleAfter: [12, 14],
    }

    /**
     * Store raw data. This IS NOT used for chart, see `this.domains`.
     */
    private domainsRaw: undefined | IRaw[]
    @observable.deep public modelArgs: IModelArgsExpanded = DomainStore.DEFAULT_ARGS

    private piwikStore: PiwikStore
    @observable public domainNames: [string, string][] = [[WORLD, WORLD]]
    @observable public selector: string = WORLD
    @observable public smooth = true

    public constructor(piwikStore: PiwikStore) {
        this.piwikStore = piwikStore
    }

    @action public async init() {
        if(this.domains !== undefined) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const domainsRaw = (await import(/* webpackChunkName: "data" */'../../static/domains.json')).default as any as IRaw[]
        console.log(domainsRaw)

        const domainNames = [...this.domainNames]
        this.domainsRaw = domainsRaw
        for(const domain of this.domainsRaw) {
            domainNames.push([domain.country, domain.country])
            if(domain.county) domainNames.push([domain.county, `${domain.country}: ${domain.county}`])
            if(domain.subdivision) {
                if(domain.county) {
                    domainNames.push([domain.subdivision, `${domain.country}: ${domain.county}: ${domain.subdivision}`])
                } else {
                    domainNames.push([domain.subdivision, `${domain.country}: ${domain.subdivision}`])
                }
            }
        }
        console.log([...new Map(domainNames)])

        const max = this.domainsRaw.reduce((max2, domain) => {
            return domain.cases.reduce((max3, datum) => max3 > datum[CASE_INDEX.DATE] ? max3 : datum[CASE_INDEX.DATE], '2020-01-01')
        }, '2020-01-01')

        const lastDateInData = moment(max)

        const domains = this.domainsRaw.map((domainRaw) => {
            const normalizedCasesMap = new Map<string, IRawCase>(domainRaw.cases.map((datum)=>[datum[CASE_INDEX.DATE], datum]))
            const normalizedCases = new Array(lastDateInData.diff(DomainStore.START(), 'd') + 1).fill(null)
                .map<IRawCase>((_, index) => {
                    const date = DomainStore.START().add(index, 'd').format('YYYY-MM-DD')
                    return normalizedCasesMap.get(date) || [date, 0, 0, 0]
                })
            return {
                ...domainRaw,
                cases: normalizedCases,
            }
        })

        runInAction(() => {
            this.lastDateInData = lastDateInData
            this.domains = domains
            this.domainNames = [...new Map(domainNames)]
        })
    }

    @observable public lastDateInData: undefined | moment.Moment

    /**
     * Normalized input data, where length of cases are truncated or padded
     * to have equal length from 1 Feb to latest date found in data.
     */
    @observable private domains: undefined | IRaw[]

    /**
     * Select one or merge multiple domains into one
     * based on `this.selector`.
     */
    @computed private get dataRaw(): undefined | IRaw {
        if(!this.domains) return undefined

        const domains = this.domains
            .filter((domain) => this.selector === WORLD
                || this.selector === domain.country
                || this.selector === domain.county
                || this.selector === domain.subdivision
            )
        if(domains.length === 1) return domains[0]

        const caseMap = new Map<string, IRawCase>()
        for(const domain of domains) {
            for(const acase of domain.cases) {
                const date = acase[0]
                if(!caseMap.has(date)) caseMap.set(date, [date, 0, 0, 0])
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const mergedCase = caseMap.get(date)!
                mergedCase[1] = mergedCase[1] + acase[1]
                mergedCase[2] = mergedCase[2] + acase[2]
                mergedCase[3] = mergedCase[3] + acase[3]
            }
        }

        return {
            country: this.selector,
            county: this.selector,
            subdivision: this.selector,
            cases: [...caseMap.values()]
        }

    }

    @computed public get data(): undefined | ICase[] {
        if(!this.dataRaw) return undefined

        return this.dataRaw.cases.map((datum, i, array): ICase => {
            const deathsDelta = this.smooth
                ? smoothDeaths(i, array)
                : (datum[CASE_INDEX.DEATHS] - (i === 0 ? 0 : array[i-1][CASE_INDEX.DEATHS]))

            const active = datum[CASE_INDEX.CONFIRMED] - datum[CASE_INDEX.DEATHS] - datum[CASE_INDEX.RECOVERED]
            const lower = modelByTomasPueyo(deathsDelta, {
                daysToDeath: this.modelArgs.daysToDeath[0],
                daysToDouble: this.modelArgs.daysToDouble[1],
                deathRate: this.modelArgs.deathRate[1],
            })
            const upper = modelByTomasPueyo(deathsDelta, {
                daysToDeath: this.modelArgs.daysToDeath[1],
                daysToDouble: this.modelArgs.daysToDouble[0],
                deathRate: this.modelArgs.deathRate[0],
            })

            return [...datum, active, lower, upper] as ICase
        })
    }

    public setSelectedDomain = action((domainEntry: [string, string]) => {
        this.piwikStore.push([
            'trackEvent',
            'model',
            'search',
            domainEntry[0],
        ])
        this.selector = domainEntry[0]
    })
    public setSmooth = action((valueOrEvent: boolean | React.ChangeEvent<HTMLInputElement>) => {
        const bool = typeof valueOrEvent === 'boolean' ? valueOrEvent : valueOrEvent.target.checked
        this.piwikStore.push([
            'trackEvent',
            'model',
            'smooth',
            bool ? 'on' : 'off',
        ])
        this.smooth = bool
    })
}


// @computed public get data(): ICase[] {
//     return this.dataRaw.cases.map((datum): ICase => {
//         const date = moment(datum[0])
//         const deaths = datum[CASE_INDEX.DEATHS]
//         const lockdownToDeath = Math.max(0, date.diff(this.modelArgs.lockdown, 'd'))
//         const infectedToLockdownLower = Math.max(0, -date.diff(this.modelArgs.lockdown, 'd') + this.modelArgs.daysToDeath[0])
//         const infectedToLockdownUpper = Math.max(0, -date.diff(this.modelArgs.lockdown, 'd') + this.modelArgs.daysToDeath[1])

//         const afterToBeforeLower =
//             lockdownToDeath === 0 ? 0 :
//             infectedToLockdownLower === 0 ? 1 :
//             lockdownToDeath / (lockdownToDeath+infectedToLockdownLower)
//         const afterToBeforeUpper =
//             lockdownToDeath === 0 ? 0 :
//             infectedToLockdownLower === 0 ? 1 :
//             lockdownToDeath / (lockdownToDeath+infectedToLockdownUpper)

//         const coefLower = this.modelArgs.daysToDeath[0] * (
//             afterToBeforeLower / this.modelArgs.daysToDoubleAfter[1]
//             + (1 - afterToBeforeLower) / this.modelArgs.daysToDoubleBefore[1]
//         )

//         const coefUpper = this.modelArgs.daysToDeath[0] * (
//             afterToBeforeUpper / this.modelArgs.daysToDoubleAfter[0]
//             + (1 - afterToBeforeUpper) / this.modelArgs.daysToDoubleBefore[0]
//         )

//         const active = datum[CASE_INDEX.CONFIRMED] - datum[CASE_INDEX.DEATHS] - datum[CASE_INDEX.RECOVERED]
//         const lower = deaths / this.modelArgs.deathRate[1] * Math.pow(2, coefLower)
//         const upper = deaths / this.modelArgs.deathRate[0] * Math.pow(2, coefUpper)
//         return [...datum, active, lower, upper] as ICase
//     })
// }
