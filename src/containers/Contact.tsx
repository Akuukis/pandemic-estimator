import * as React from 'react'
import { hot } from 'react-hot-loader/root'

import { Grid, Paper, Typography } from '@material-ui/core'

import { createSmartFC, createStyles, IMyTheme } from '../common/'

const styles = (theme: IMyTheme) => createStyles({
    root: {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.background.default,
    },
    content: {
        maxWidth: theme.spacing(80),
    }
})


interface IProps {
}


export default hot(createSmartFC(styles)<IProps>(({children, classes, theme, ...props}) => {

    return (
        <Paper className={classes.root}>
            <Grid container spacing={2} justify='center'>
                <Grid item xs={12} className={classes.content}>
                    <Typography variant='h2'>Contact Us</Typography>
                    <Typography paragraph>
                        <ul>
                            <li>email: kalvis [at] kalvis [dot] lv</li>
                            <li>github: <a target='_blank' rel='noopener noreferrer' href='https://github.com/Akuukis/pandemic-estimator'>https://github.com/Akuukis/pandemic-estimator</a></li>
                        </ul>
                    </Typography>
                    <Typography variant='h2'>About Us</Typography>
                    <Typography paragraph>
                        We came together and made this webpage during the <a target='_blank' rel='noopener noreferrer' href='http://hackforce.lv/'>hackforce.lv</a> virtual hackathon.
                    </Typography>
                    <Typography paragraph component='div'>
                        Team:
                        <ul>
                            <li>Kalvis Kalniņš - Team Lead & Front-end Developer</li>
                            <li>Kristaps Krūze - Design & UX</li>
                            <li>Toms Rijnieks - Data & Back-end Developer</li>
                        </ul>
                    </Typography>
                    <Typography paragraph component='div'>
                        Thanks to:
                        <ul>
                            <li>Ieva Baranova - copywriting & proofreading</li>
                            <li>Gleb Maltsev - mentorship</li>
                            <li>Jūlija Gifford - mentorship</li>
                            <li>Edgars Zvirgzdiņš - mentorship</li>
                        </ul>
                    </Typography>
                </Grid>
            </Grid>
        </Paper>
    )
})) /* ============================================================================================================= */
