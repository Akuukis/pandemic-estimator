import './rhlConfig'

import { configure } from 'mobx'
import * as React from 'react'
import { render } from 'react-dom'

import { ThemeProvider } from '@material-ui/styles'

import { MY_THEME } from './common'
import routes from './routes'
import { CONTEXT } from './stores'
import { PiwikStore } from './stores/PiwikStore'

// enable MobX strict mode
configure({ enforceActions: 'always' })

// From webpack.
declare const __MATOMO_SITE_ID__: number
declare const __MATOMO_URL__: string

// prepare MobX stores
const piwikStore = new PiwikStore(process.env.NODE_ENV === 'development' ? {} : {
    siteId: __MATOMO_SITE_ID__,
    url: __MATOMO_URL__,
})

render((
        <ThemeProvider theme={MY_THEME}>
            <CONTEXT.PIWIK.Provider value={piwikStore}>
                {routes}
            </CONTEXT.PIWIK.Provider>
        </ThemeProvider>
    ),
    document.getElementById('root'),
)
