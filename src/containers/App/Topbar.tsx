import * as React from 'react'
import { hot } from 'react-hot-loader/root'

import { AppBar, Toolbar, Typography } from '@material-ui/core'

import { createSmartFC, createStyles, IMyTheme } from '../../common/'
import { ROUTES } from '../../constants/routes'
import TopbarButton from './TopbarButton'
import logo from '../../../static/logo.svg'


const styles = (theme: IMyTheme) => createStyles({
    root: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.primary.main,
        borderColor: theme.palette.background.paper,
        borderWidth: '0px 0px thin 0px',
        borderStyle: 'solid',
    },
})


interface IProps {
}


export default hot(createSmartFC(styles)<IProps>(({children, classes, theme, ...props}) => {

    return (
        <AppBar position='relative' className={classes.root}>
            <Toolbar>
                <TopbarButton route={ROUTES.HOME}>
                    <img src={logo} alt="Pandemic Estimator" />
                </TopbarButton>
                <div style={{flex: 1}} />
                <TopbarButton route={ROUTES.HOME}>
                    <Typography variant='button'>
                        {'Model'}
                    </Typography>
                </TopbarButton>
                <TopbarButton route={ROUTES.METHODOLOGY}>
                    <Typography variant='button'>
                        {'Methodology'}
                    </Typography>
                </TopbarButton>
                <TopbarButton route={ROUTES.CONTACT}>
                    <Typography variant='button'>
                        {'Contact'}
                    </Typography>
                </TopbarButton>
            </Toolbar>
        </AppBar>
    )
})) /* ============================================================================================================= */
