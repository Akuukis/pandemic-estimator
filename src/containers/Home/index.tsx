import * as React from 'react'
import { hot } from 'react-hot-loader/root'

import { Grid } from '@material-ui/core'

import { createSmartFC, createStyles, IMyTheme } from '../../common/'
import LeftPanel from './LeftPanel'
import TopPanel from './TopPanel'
import Chart from './Chart'
import Prologue from './Prologue'


const styles = (theme: IMyTheme) => createStyles({
    root: {
    },
    chartArea: {
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
    }
})


interface IProps {
}


export default hot(createSmartFC(styles)<IProps>(({children, classes, theme, ...props}) => {

    return (
        <>
            <Prologue />
            <Grid container justify='center' alignItems='stretch' className={classes.chartArea}>
                <Grid item xs={12} sm={1} className={classes.sidePanel}>
                    <LeftPanel />
                </Grid>
                <Grid item xs={12} sm className={classes.main}>
                    <Grid container justify='center' alignItems='stretch' direction='column' style={{height: '100%'}}>
                        <Grid item>
                            <TopPanel />
                        </Grid>
                        <Grid
                            item
                            style={{
                                flexGrow: 1,
                                height: '1vh',  // Workaround for Safari (https://stackoverflow.com/a/44819258/4817809)
                            }}
                        >
                            <Chart />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </>
    )
})) /* ============================================================================================================= */
