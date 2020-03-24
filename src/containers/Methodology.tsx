import * as React from 'react'
import { hot } from 'react-hot-loader/root'
import MathJax from 'react-mathjax2'

import { Grid, Paper, Typography } from '@material-ui/core'

import { createSmartFC, createStyles, IMyTheme } from '../common/'

const styles = (theme: IMyTheme) => createStyles({
    root: {
        padding: `${theme.spacing(2)}px`,
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
        <Paper square className={classes.root}>
            <Grid container spacing={2} justify='center'>
                <Grid item xs={12} className={classes.content}>

                    <Typography gutterBottom variant='h2'>Methodology</Typography>
                    <Typography paragraph>
                        This interactive chart based on a model by <a target='_blank' rel='noopener noreferrer' href='https://medium.com/@tomaspueyo/coronavirus-act-today-or-people-will-die-f4d3d9cd99ca'>Tomas Pueyo</a>.
                        His article that describes the model is endorsed by more than 50 experts and academics (see the full list <a target='_blank' rel='noopener noreferrer' href='https://medium.com/tomas-pueyo/coronavirus-articles-endorsements-fdc68614f8e3'>here</a>).
                    </Typography>
                    <Typography paragraph component='div'>
                        The model has the following input arguments:
                        <ul>
                            <li>Deaths - number of deaths on a given day (not the cumulative value)</li>
                            <li>Fatality Rate - percentage of confirmed cases that have resulted in the patient’s death</li>
                            <li>Doubling Time - number of days it takes for the amount of cases to double</li>
                            <li>Time from symptom onset to death - number of days it takes for the cases to become deaths</li>
                        </ul>
                    </Typography>
                    <Typography paragraph>
                        Here&apos;s the exact formula used for estimated actual cases:
                    </Typography>
                    <Typography paragraph align='center' component='div' variant='body1'>
                        <MathJax.Context input='ascii'>
                            <MathJax.Node>{'(deaths) / (fatalityRate) xx 2 ^ ((daysT oDeath) / (daysT oDoubl e))'}</MathJax.Node>
                        </MathJax.Context>
                    </Typography>

                    <Typography gutterBottom variant='h4'>Range</Typography>
                    <Typography paragraph component='div'>
                        To avoid illusion of certainty of estimates, we require a range for input arguments and provide a range for the estimate.
                        We just run the formula twice for each of the lower and upper bound of the estimate.
                        <MathJax.Context input='ascii'>
                        <ul>
                            <li>Lower estimate uses upper <MathJax.Node inline>fatalityRate</MathJax.Node>, lower <MathJax.Node inline>daysT oDeath</MathJax.Node> and upper <MathJax.Node inline>daysT oDoubl e</MathJax.Node></li>
                            <li>Upper estimate uses lower <MathJax.Node inline>fatalityRate</MathJax.Node>, upper <MathJax.Node inline>daysT oDeath</MathJax.Node> and lower <MathJax.Node inline>daysT oDoubl e</MathJax.Node></li>
                        </ul>
                        </MathJax.Context>
                    </Typography>

                    <Typography gutterBottom variant='h4'>Default Argument values</Typography>
                    <Typography paragraph component='div'>
                        The default values for each of three arguments are set as a small spread around the estimated value presented in the article.
                        The minimal and maximal value for each of three arguments are set according to minimal and maximal value found by researches linked by article.
                    </Typography>

                    <Typography gutterBottom variant='h4'>Running Average</Typography>
                    <Typography paragraph>
                        By default, we &quot;smooth&quot; the estimates by using running 7-day average deaths instead of exact deaths.
                        That eliminates bumps and spikes in estimates, especially where death count is sparse (e.g. Japan).
                        It can be disabled by using a switch control at the top right corner of the chart.
                        The exact &quot;smoothing&quot; formula is as follows:
                        <ul>
                            <li>first and last data series: exact value</li>
                            <li>2nd first and last data series: average of 3 days (one day before and after)</li>
                            <li>3nd first and last data series: average of 5 days (two days before and after)</li>
                            <li>the rest of the data series: average of 7 days (three days before and after)</li>
                        </ul>
                    </Typography>

                    <Typography gutterBottom variant='h2'>Data</Typography>
                    <Typography paragraph>
                        We use data from <a target='_blank' rel='noopener noreferrer' href='https://systems.jhu.edu/'>CSSE at Johns Hopkins University</a> git repository on <a target='_blank' rel='noopener noreferrer' href='//github.com/CSSEGISandData/COVID-19'>github</a>.
                        They provide daily data on confirmed cases of COVID-19, as well as deaths and cases of recovery grouped by country or lower level.
                        Although they provide very comprehensive and up-to-date information that most of the (global) dashboards online rely on,
                        they are not without faults and errors as shown by outstanding 500+ issues and 100+ pull requests.
                    </Typography>
                    <Typography paragraph>
                        We use their daily reports <a target='_blank' rel='noopener noreferrer' href='//github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_daily_reports'>here</a>, out of which some are ignored due to corrupt structure and/or missing data points.
                    </Typography>
                </Grid>
            </Grid>
        </Paper>
    )
})) /* ============================================================================================================= */
