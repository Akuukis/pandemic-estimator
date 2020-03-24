import * as React from 'react'
import { hot } from 'react-hot-loader/root'

import { Grid, Paper, Typography } from '@material-ui/core'

import { createSmartFC, createStyles, IMyTheme } from '../../common/'
import Slider from '../../components/Slider'
import LeftPanelReset from './LeftPanelReset'
import LeftPanelSearch from './LeftPanelSearch'
import { DomainStore } from '../../stores/DomainStore'

const formatDeathRate = (value: number) => `${value.toFixed(1)}%`
const formatDays = (value: number) => `${value.toString()}`

const styles = (theme: IMyTheme) => createStyles({
    root: {
        [`@media (min-width: ${theme.breakpoints.values.sm}px)`]: {
            padding: `${theme.spacing(4)}px ${theme.spacing(6)}px`,
            width: `calc(100% - 1px - ${theme.spacing(12)}px)`,
            height: `calc(100% - 1px - ${theme.spacing(8)}px)`,
        },
        padding: `${theme.spacing(2)}px`,
        width: `calc(100% - 1px - ${theme.spacing(4)}px)`,
        height: `calc(100% - 1px - ${theme.spacing(4)}px)`,
        borderColor: theme.palette.background.paper,
        borderWidth: '0px thin thin 0px',
        borderStyle: 'solid',
    },
})


interface IProps {
}


export default hot(createSmartFC(styles)<IProps>(({children, classes, theme, ...props}) => {

    return (
        <Paper square className={classes.root}>
            <LeftPanelSearch />

            <Grid container spacing={1} justify='space-between' alignItems='center'>
                <Grid item>
                    <Typography variant='h4'>Model</Typography>
                </Grid>
                <Grid item>
                    <LeftPanelReset />
                </Grid>
            </Grid>

            <Slider
                title='AVG Days to Double'
                tooltip='Range of days it takes to have twice as much COVID-19 cases on average.'
                argKey='daysToDouble'
                min={DomainStore.EXTREME_ARGS.daysToDouble[0]}
                max={DomainStore.EXTREME_ARGS.daysToDouble[1]}
                step={0.5}
                format={formatDays}
            />
            <Slider
                title='Death Rate'
                tooltip='% of Confirmed cases that ended with Death.'
                argKey='deathRate'
                percent
                min={DomainStore.EXTREME_ARGS.deathRate[0]}
                max={DomainStore.EXTREME_ARGS.deathRate[1]}
                step={0.001}
                format={formatDeathRate}
            />
            <Slider
                title='AVG Days to Death'
                tooltip='How many days it takes for individual from getting infected to dying.'
                argKey='daysToDeath'
                min={DomainStore.EXTREME_ARGS.daysToDeath[0]}
                max={DomainStore.EXTREME_ARGS.daysToDeath[1]}
                step={0.5}
                format={formatDays}
            />
            {/* <Divider />
            <SliderDate
                title='Lockdown Date'
                argKey='lockdown'
                min={moment('2020-02-01')}
                max={moment()}
            />
            <Slider
                title='AVG Days to Double (after Lockdown)'
                argKey='daysToDoubleAfter'
                min={10}
                max={100}
                step={1}
                format={formatDays}
            /> */}
        </Paper>
    )
})) /* ============================================================================================================= */
