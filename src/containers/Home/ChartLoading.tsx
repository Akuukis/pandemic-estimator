import * as React from 'react'
import { hot } from 'react-hot-loader/root'

import { Grid, Typography } from '@material-ui/core'

import { createSmartFC, createStyles, IMyTheme } from '../../common/'


const styles = (theme: IMyTheme) => createStyles({
    root: {
        [`@media (min-width: ${theme.breakpoints.values.sm}px)`]: {
            padding: theme.spacing(4),
        },
        padding: theme.spacing(2),
        fontStyle: 'italic',
    },
})


interface IProps {
}


export default hot(createSmartFC(styles)<IProps>(({children, classes, theme, ...props}) => {
    return (
        <>
            <Grid className={classes.root}>
                <Typography variant='h4'>
                    Loading data, please wait...
                </Typography>
            </Grid>
        </>
    )
})) /* ============================================================================================================= */
