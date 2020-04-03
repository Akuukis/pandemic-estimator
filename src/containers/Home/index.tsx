import * as React from 'react'
import { hot } from 'react-hot-loader/root'
import { useLocation } from 'react-router-dom'

import { Grid } from '@material-ui/core'

import { createSmartFC, createStyles, IMyTheme, useAsyncEffectOnce } from '../../common/'
import { ROUTES } from '../../constants/routes'
import { CONTEXT } from '../../stores'
import { LocationStore } from '../../stores/LocationStore'
import Chart from './Chart'
import Prologue from './Prologue'


const styles = (theme: IMyTheme) => createStyles({
    root: {
    },
    chart: {
        flexGrow: 1,
        height: '100vh',
    },
})


interface IProps {
}


export default hot(createSmartFC(styles)<IProps>(({children, classes, theme, ...props}) => {
    const location = useLocation()
    const piwikStore = React.useContext(CONTEXT.PIWIK)
    const [locationStore, setLocationStore] = React.useState<null|LocationStore>(null)

    useAsyncEffectOnce(async () => {
        setLocationStore(await LocationStore.new(piwikStore))
    })

    return (
        <CONTEXT.LOCATION.Provider value={locationStore as LocationStore}>
            {location.pathname === ROUTES.FULLSCREEN ? null : (<Prologue />)}
            <Grid container justify='center' alignItems='stretch' className={classes.chart}>
                <Chart />
            </Grid>
        </CONTEXT.LOCATION.Provider>
    )
})) /* ============================================================================================================= */
