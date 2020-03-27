import * as React from 'react'
import { hot } from 'react-hot-loader/root'

import { Grid, Paper, Switch, createStyles } from '@material-ui/core'
import TopPanelIcon from './TopPanelIcon'
import { formatDecimal, createSmartFC, formatFloat, IMyTheme } from '../../common'
import { CONTEXT } from '../../stores'


const styles = (theme: IMyTheme) => createStyles({
    root: {
    },

    item: {
        height: `calc(100% - 1px - 2 * ${theme.spacing(2)}px)`,
        padding: `${theme.spacing(2)}px ${theme.spacing(2)}px`,
        backgroundColor: theme.palette.background.default,
        borderColor: theme.palette.background.paper,
        borderWidth: '0px 1px 1px 0px',
        borderStyle: 'solid',
    },
    fixSwitch: {
        marginTop: -theme.spacing(1),
        marginBottom: -theme.spacing(0.5),
    },
    icon: {
        verticalAlign: 'bottom',
    }
})


interface IProps {
}


export default hot(createSmartFC(styles)<IProps>(({children, classes, theme, ...props}) => {
    const domainStore = React.useContext(CONTEXT.DOMAIN)

    const today = domainStore.data?.[domainStore.data.length - 1]

    const getActualEstimate = () => {
        if(today === undefined) return '-'
        if(today.deaths === 0) return 'N/A'
        return `${formatFloat(today.actualMin)} - ${formatFloat(today.actualMax)}`
    }

    return (
        <Paper square className={classes.root}>
            <Grid container justify='center' alignItems='stretch'>
                <Grid item xs={6} sm={4} lg={2}>
                    <TopPanelIcon
                        value={today === undefined ? '-' : formatDecimal(today.deaths)}
                        title='Deaths'
                        tooltip='Ofiicial amount of deaths by COVID-19'
                        color='red'
                    />
                </Grid>
                <Grid item xs={6} sm={4} lg={2}>
                    <TopPanelIcon
                        value={today === undefined ? '-' : formatDecimal(today.cases)}
                        title='Confirmed'
                        tooltip='Official amount of people that got a positive result of COVID-19'
                        color='yellow'
                    />
                </Grid>
                <Grid item xs={6} sm={4} lg={2}>
                    <TopPanelIcon
                        value={today === undefined ? '-' : formatDecimal(today.recovered)}
                        title='Recovered'
                        tooltip='Official amount of people that have recovered after having a positive result of COVID-19'
                        color='green'
                    />
                </Grid>
                <Grid item xs={6} sm={4} lg={2}>
                    <TopPanelIcon
                        value={today === undefined ? '-' : formatDecimal(today.active)}
                        title='Active'
                        tooltip='Confirmed minus Recovered and Deaths.'
                        color='magenta'
                    />
                </Grid>
                <Grid item xs={6} sm={4} lg={2}>
                    <TopPanelIcon
                        value={getActualEstimate()}
                        title='Est. Actual'
                        tooltip='Estimated Actual cases are Confirmed cases plus all other sick people that haven’t taken the test yet.'
                        color='#479cff'
                    />
                </Grid>
                <Grid item xs={6} sm={4} lg={2}>
                    <TopPanelIcon
                        value={<Switch
                            classes={{root: classes.fixSwitch}}
                            checked={domainStore.smooth}
                            onChange={domainStore.setSmooth}
                        />}
                        title='Smooth'
                        tooltip='Smooth Estimated Actual cases across 7 days.'
                        color='#00000000'
                    />
                </Grid>
            </Grid>
        </Paper>
    )
})) /* ============================================================================================================= */
