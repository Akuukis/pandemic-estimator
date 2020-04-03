import * as React from 'react'
import { hot } from 'react-hot-loader/root'
import { useLocation } from 'react-router-dom'

import { Grid, Paper } from '@material-ui/core'

import { createSmartFC, createStyles, IMyTheme } from '../../common/'
import { ROUTES } from '../../constants/routes'
import ChartLine from '../../d3charts/ChartLine'
import { CONTEXT } from '../../stores'
import ChartLoading from './ChartLoading'
import LeftPanel from './LeftPanel'
import TopPanel from './TopPanel'


const styles = (theme: IMyTheme) => createStyles({
    root: {
        flexGrow: 1,
        height: '100vh',
    },

    sidePanel: {
        [`@media (min-width: ${theme.breakpoints.values.sm}px)`]: {
            overflowY: 'auto',
            height: '100%',
        },
        minWidth:'300px',
        overflowX: 'hidden',
    },
    main: {
        height: '100%',
    },
    chartGrid: {
        flexGrow: 1,
        height: '1vh',  // Workaround for Safari (https://stackoverflow.com/a/44819258/4817809)
    },
    chartPaper: {
        backgroundColor: theme.palette.background.paper,
        height: '100%',
    }
})


interface IProps {
}


export default hot(createSmartFC(styles)<IProps>(({children, classes, theme, ...props}) => {
    const location = useLocation()
    const locationStore = React.useContext(CONTEXT.LOCATION)

    // This is only place where locationStore could be null. So type is as always present.
    if(!locationStore) return (<ChartLoading />)

    return (
        <>
            {location.pathname === ROUTES.FULLSCREEN ?
                null
            : (
                <Grid item xs={12} sm={1} className={classes.sidePanel}>
                    <LeftPanel />
                </Grid>
            )
            }

            <Grid item xs={12} sm className={classes.main}>
                <Grid container justify='center' alignItems='stretch' direction='column' style={{height: '100%', flexWrap: 'nowrap'}}>
                    <Grid item>
                        <TopPanel />
                    </Grid>
                    <Grid item className={classes.chartGrid}>
                        <Paper square className={classes.chartPaper}>
                            <ChartLine
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                location={locationStore.location!}
                                lockdownDate={locationStore.modelArgs.lockdown}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
        </>
    )
})) /* ============================================================================================================= */
