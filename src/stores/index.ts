/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext } from 'react'

import { DomainStore } from './DomainStore'
import { PiwikStore } from './PiwikStore'


// tslint:disable: no-any
export const CONTEXT = {
    DOMAIN: createContext<DomainStore>(null as any),
    PIWIK: createContext<PiwikStore>(null as any),
}

export type Context = {
    [TProp in keyof typeof CONTEXT]: typeof CONTEXT[TProp] extends React.Context<infer TStore> ? TStore : never
}
