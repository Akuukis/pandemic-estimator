import * as React from 'react'
import { hot } from 'react-hot-loader/root'

import { createStyles, Grid, Switch } from '@material-ui/core'

import { createSmartFC, formatDecimal, formatFloat, IMyTheme } from '../../common'
import { CONTEXT } from '../../stores'
import TopPanelIcon from './TopPanelIcon'


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
        verticalAlign: 'sub',
    }
})


interface IProps {
}


export default hot(createSmartFC(styles)<IProps>(({children, classes, theme, ...props}) => {
    const locationStore = React.useContext(CONTEXT.LOCATION)

    const today = locationStore.data?.[locationStore.data.length - 1]

    const getActualEstimate = () => {
        if(today === undefined) return '-'
        if(today.deaths === 0) return 'N/A'
        return `${formatFloat(today.actualMin)} - ${formatFloat(today.actualMax)}`
    }

    return (
        <Grid container justify='center' alignItems='stretch' className={classes.root}>
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
                    value={today === undefined ? '-' : formatDecimal(today.confirmed)}
                    title='Confirmed'
                    tooltip='Official amount of people that got a positive result of COVID-19'
                    color='yellow'
                />
            </Grid>
            <Grid item xs={6} sm={4} lg={2}>
                <TopPanelIcon
                    value={today === undefined ? '-' : (today.recovered === 0 ? 'N/A' : formatDecimal(today.recovered))}
                    title='Recovered'
                    tooltip='Official amount of people that have recovered after having a positive result of COVID-19. Some countries are missing data after Mar 23.'
                    color='green'
                />
            </Grid>
            <Grid item xs={6} sm={4} lg={2}>
                <TopPanelIcon
                    value={today === undefined ? '-' : (today.active === 0 ? 'N/A' : formatDecimal(today.active))}
                    title='Active'
                    tooltip='Confirmed minus Recovered and Deaths. Some countries are missing data after Mar 23.'
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
                        checked={locationStore.smooth}
                        onChange={locationStore.setSmooth}
                    />}
                    title='Smooth'
                    tooltip='Smooth Estimated Actual cases across 7 days.'
                    color='#00000000'
                />
            </Grid>
        </Grid>
    )
})) /* ============================================================================================================= */
