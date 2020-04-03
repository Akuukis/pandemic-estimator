import * as React from 'react'
import { hot } from 'react-hot-loader/root'

import { Grid, Paper } from '@material-ui/core'

import { createSmartFC, createStyles, IMyTheme } from '../../common/'
import ChartLine from '../../d3charts/ChartLine'
import { CONTEXT } from '../../stores'
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
    const locationStore = React.useContext(CONTEXT.LOCATION)

    if(!locationStore) return null

    return (
        <>
            <Grid item xs={12} sm={1} className={classes.sidePanel}>
                <LeftPanel />
            </Grid>
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
