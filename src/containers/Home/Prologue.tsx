import * as React from 'react'
import { hot } from 'react-hot-loader/root'

import { Grid, Paper, Typography } from '@material-ui/core'

import { createSmartFC, createStyles, IMyTheme } from '../../common/'

const styles = (theme: IMyTheme) => createStyles({
    root: {
        [`@media (min-width: ${theme.breakpoints.values.sm}px)`]: {
            paddingLeft: `${theme.spacing(12)}px`,

            paddingBottom: `${theme.spacing(8)}px`,
            paddingTop: `${theme.spacing(8)}px`,
        },
        padding: `${theme.spacing(4)}px`,
        borderColor: theme.palette.background.paper,
        borderWidth: '0px 0px thin 0px',
        borderStyle: 'solid',
    },
    readMore: {
        cursor: 'pointer',
        color: '#479cff',
        fontWeight: 'bold',
    }
})


interface IProps {
}


export default hot(createSmartFC(styles)<IProps>(({children, classes, theme, ...props}) => {

    return (
        <Paper square className={classes.root}>
            <Grid container spacing={1} justify='flex-start'>
                <Grid item xs={12} sm={10} md={8}>
                    <Typography variant='h2'>Find out how many people are actually infected right now</Typography>
                </Grid>
                <Grid item xs={12} />
                <Grid item xs={12} sm={10} md={8}>
                    <Typography paragraph variant='body2'>
                        Confirmed cases and Actual cases of COVID-19 are not the same.
                        But people and media often use these terms as synonyms.
                        Our online tool gives an estimate of the actual cases based on the model developed
                        by <a target='_blank' rel='noopener noreferrer' href='https://medium.com/@tomaspueyo/coronavirus-act-today-or-people-will-die-f4d3d9cd99ca'>Tomas Pueyo</a>.
                        Change the options on the side panel to model actual cases based on deaths for specific countries or age groups.
                    </Typography>
                </Grid>
            </Grid>
        </Paper>
    )
})) /* ============================================================================================================= */
