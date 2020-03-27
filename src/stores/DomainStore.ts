import { action, computed, observable, runInAction } from 'mobx'
import worldCountries from 'world-countries'

import { PiwikStore } from './PiwikStore'
import * as moment from 'moment'


const getName = (cca3: string): string => {
    const title = worldCountries.find((country) => country.cca3 === cca3)?.name?.common ?? cca3
    return title
}

export interface ILocationDate {
    cases?: number
    deaths?: number
    recovered?: number
    active?: number
    growthFactor?: number | null
}
export interface ILocationDateExtended extends ILocationDate {
    date: moment.Moment
    cases: number
    deaths: number
    recovered: number
    active: number
    actualMin: number
    actualMax: number
    growthFactor: number | null
}
export enum LOCATION_TYPE {
    COUNTRY = 'country',
    STATE = 'state',
    COUNTY = 'county',
    CITY = 'city',
}

/**
 * Cases are daily data series that starts on `2020-01-01`
 */
export interface IRaw<TType extends LOCATION_TYPE = LOCATION_TYPE, TCase extends ILocationDate | ILocationDateExtended = ILocationDate> {
    city: TType extends LOCATION_TYPE.CITY ? string : never
    county: TType extends LOCATION_TYPE.CITY | LOCATION_TYPE.COUNTY ? string : never
    state: TType extends LOCATION_TYPE.CITY | LOCATION_TYPE.COUNTY | LOCATION_TYPE.STATE ? string : never
    country: string  // cca3
    dates: Record<string, TCase>
    maintainers: unknown
    url: string
    aggregate: LOCATION_TYPE
    rating: number
    curators: unknown
    coordinates: [number, number]
    tz: unknown
    featureId: number
    population: number
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
const smoothDeaths = (i: number, array: [string, ILocationDate][]): number => {
    if(i === 0) return array[i][1].deaths ?? 0

    const deaths = [
        (i > 3 && i+3 < array.length) ? (array[i-4][1].deaths ?? 0) : undefined,
        (i > 2 && i+2 < array.length) ? (array[i-3][1].deaths ?? 0) : undefined,
        (i > 1 && i+1 < array.length) ? (array[i-2][1].deaths ?? 0) : undefined,
        (array[i-1][1].deaths ?? 0),
        (array[i][1].deaths ?? 0),
        (i > 1 && i+1 < array.length) ? (array[i+1][1].deaths ?? 0) : undefined,
        (i > 2 && i+2 < array.length) ? (array[i+2][1].deaths ?? 0) : undefined,
        (i > 3 && i+3 < array.length) ? (array[i+3][1].deaths ?? 0) : undefined,
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

    @observable.deep public modelArgs: IModelArgsExpanded = DomainStore.DEFAULT_ARGS

    private piwikStore: PiwikStore
    @observable public domainNames: [number, string][] = []  // [[WORLD, WORLD]]
    @observable public selector = 338  // 'Italy'
    @observable public smooth = true

    public constructor(piwikStore: PiwikStore) {
        this.piwikStore = piwikStore
    }

    @action public async init() {
        if(this.domains !== undefined) return

        const response = (await fetch('https://coronadatascraper.com/timeseries-byLocation.json'))
        const domainsRaw: IRaw[] = Object.values(await response.json())

        const domainNames = [...this.domainNames]
        for(const domain of domainsRaw) {
            if(domain.city) {
                domainNames.push([domain.featureId, `${getName(domain.country)}: ${domain.state}: ${domain.county}: ${domain.city}`])
            } else if (domain.county) {
                domainNames.push([domain.featureId, `${getName(domain.country)}: ${domain.state}: ${domain.county}`])
            } else if (domain.state) {
                domainNames.push([domain.featureId, `${getName(domain.country)}: ${domain.state}`])
            } else {
                domainNames.push([domain.featureId, `${getName(domain.country)}`])
            }
        }
        const domainNamesSorted = [...new Map(domainNames)]
            .sort((a, b) => a[1] < b[1] ? -1 : 1)

        const max = domainsRaw.reduce((max2, domain) => {
            return Object.keys(domain.dates).reduce((max3, date) => max3 > date ? max3 : date, '2020-01-01')
        }, '2020-01-01')

        const lastDateInData = moment(max)

        runInAction(() => {
            this.lastDateInData = lastDateInData
            this.domains = Object.values(domainsRaw)
            this.domainNames = domainNamesSorted
        })
    }

    @observable public lastDateInData: undefined | moment.Moment

    /**
     * Normalized input data, where length of cases are truncated or padded
     * to have equal length from 1 Feb to latest date found in data.
     */
    @observable private domains: undefined | IRaw[]

    /**
     * Select one location.
     * based on `this.selector`.
     */
    @computed private get dataRaw(): undefined | IRaw {
        if(!this.domains) return undefined
        return this.domains.find((domain) => domain.featureId === this.selector)
    }

    @computed public get data(): undefined | ILocationDateExtended[] {
        if(!this.dataRaw) return undefined

        return Object.entries(this.dataRaw.dates).map(([date, datum], i, array): ILocationDateExtended => {
            const deaths = datum.deaths ?? 0
            const deathsPrev = i === 0 ? 0 : array[i-1][1].deaths ?? 0
            const deathsDelta = this.smooth
                ? smoothDeaths(i, array)
                : (deaths - deathsPrev)

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

            return {
                date: moment(date),
                cases: datum.cases ?? 0,
                deaths: datum.deaths ?? 0,
                recovered: datum.recovered ?? 0,
                active: datum.active ?? 0,
                actualMin: lower,
                actualMax: upper,
                growthFactor: datum.growthFactor ?? null,
            }
        })
    }

    public setSelectedDomain = action((domainEntry: [number, string]) => {
        this.piwikStore.push([
            'trackEvent',
            'model',
            'search',
            domainEntry[1],
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
