import * as React from 'react'
import { hot } from 'react-hot-loader/root'

import { Paper } from '@material-ui/core'

import { createSmartFC, createStyles, IMyTheme, useAsyncEffectOnce } from '../../common/'
import { CONTEXT } from '../../stores'
import ChartLine from '../../d3charts/ChartLine'


const styles = (theme: IMyTheme) => createStyles({
    root: {
        backgroundColor: theme.palette.background.paper,
        height: '100%',
    }
})


interface IProps {
}

export default hot(createSmartFC(styles)<IProps>(({children, classes, theme, ...props}) => {
    const locationStore = React.useContext(CONTEXT.LOCATION)

    useAsyncEffectOnce(() => {
        return locationStore.init()
    })

    if(locationStore.data === undefined) return (<Paper square className={classes.root} />)

    return (
        <Paper square className={classes.root}>
            <ChartLine
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                location={locationStore.location!}
                lockdownDate={locationStore.modelArgs.lockdown}
            />
        </Paper>
    )
})) /* ============================================================================================================= */
