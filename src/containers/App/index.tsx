import * as React from 'react'
import { hot } from 'react-hot-loader/root'
import { useLocation } from 'react-router-dom'

import { Paper } from '@material-ui/core'

import { createSmartFC, createStyles, IMyTheme } from '../../common/'
import { ROUTES } from '../../constants/routes'
import Topbar from './Topbar'


const styles = (theme: IMyTheme) => createStyles({
    app: {
        // '@media (min-width: 0px)': {
        //     top: 56,
        // },
        // '@media (min-width: 600px)': {
        //     top: 64,
        // },
        'fontFamily': '"Roboto", Helvetica, Arial, sans-serif',
        'fontSmoothing': 'antialiased',
        'fontWeight': 300,
        'height': '100%',
        'left': 0,
        'top': 0,
        'minWidth': '230px',
        'overflow': 'hidden',
        'position': 'fixed',
        'width': '100%',
    },
    content: {
        // '@media (min-width: 0px)': {
        //     height: 'calc(100% - 56px)',
        // },
        // '@media (min-width: 600px)': {
        //     height: 'calc(100% - 64px)',
        // },
        'background': theme.palette.background.default,
        'height': '100%',
        'overflowX': 'hidden',
        'overflowY': 'visible',
    },
})


interface IProps {
}


export default hot(createSmartFC(styles)<IProps>(({children, classes, theme, ...props}) => {
    const location = useLocation()

    return (
        <Paper square className={classes.app}>
            <Paper square className={classes.content}>
                {location.pathname === ROUTES.FULLSCREEN ? null : (<Topbar />)}
                {children}
            </Paper>
        </Paper>
    )
})) /* ============================================================================================================= */
