// tslint:disable:max-line-length
import { BigNumber as BN } from 'bignumber.js'
import { PromiseType } from 'utility-types'

// tslint:disable:no-void-expression id-length

export const ZERO = new BN(0)
export const ONE = new BN(1)

export type Await<T extends UnknownAsyncFunction> = PromiseType<ReturnType<T>>

export type IConstructor<T, TA = unknown> = new(...args: TA[]) => T

export type ClassDecoratorFixed<T> = <TFn extends IConstructor<T> = IConstructor<T>>(target: TFn) => TFn | void
export type UnknownFunction<TArgs extends unknown[] = []> = (...args: TArgs) => unknown
export type UnknownAsyncFunction<TArgs extends unknown[] = []> = (...args: TArgs) => Promise<unknown>
export type RequiredSome<T, TKey extends keyof T = keyof T> = T & { [TProp in TKey]-?: T[TProp]; }

export type ConstructorTypes<T> = T extends IConstructor<unknown, infer Args> ? Args : never


export const timebomb = async (seconds: number): Promise<never> => new Promise<never>((_, reject) => setTimeout(() => {reject(new Error('Timeouted.'))}, seconds * 1000))
export const timeout = async <TRes>(seconds: number, promise: Promise<TRes>): Promise<TRes> => Promise.race([promise, timebomb(seconds)])

export const mapToRecord = <TKey extends string | number | symbol, TValue extends unknown>(map: Map<TKey, TValue>): Record<TKey, TValue> => {
    const entries = [...map.entries()]
    const record = Object.create(null) as Record<TKey, TValue>
    for(const [key, value] of entries) record[key] = value

    return record
}

export const noop = (): void => {/* */}
