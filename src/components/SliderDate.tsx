import { action } from 'mobx'
import * as React from 'react'
import * as moment from 'moment'
import { hot } from 'react-hot-loader/root'

import { Grid, Slider, Typography } from '@material-ui/core'

import { createSmartFC, createStyles, IMyTheme } from '../common/'
import { CONTEXT } from '../stores'
import { DomainStore } from '../stores/DomainStore'


const REF = DomainStore.START()

const format = (sliderValue: number) => {
    return moment().diff(REF, 'd') === sliderValue ? 'no lockdown' : moment(REF).add(sliderValue, 'd').format('MMM\u00A0D')
}


// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const styles = (theme: IMyTheme) => createStyles({
    root: {
        marginTop: theme.spacing(1),
    },

    disabledSlider: {
        color: '#9e9e9e',
    },
})


interface IProps {
    max: moment.Moment,
    min: moment.Moment,
    title: string,
}

export default hot(createSmartFC(styles)<IProps>(({children, classes, theme, ...props}) => {
    const {title, min, max} = props
    const domainStore = React.useContext(CONTEXT.DOMAIN)

    const [value, setValue] = React.useState<Date>(domainStore.modelArgs.lockdown)

    const handleChange = (event, newValue) => {
        setValue(moment(REF).add(newValue, 'd').toDate())
    }

    const onChangeCommitted = action(() => {
        domainStore.modelArgs.lockdown = value
    })


    return (
        <Grid container justify='space-between' className={classes.root}>
            <Grid item>
                <Typography
                    id='range-slider'
                >
                    {title}
                </Typography>
            </Grid>
            <Grid item>
                <Typography>{format(moment(domainStore.modelArgs.lockdown).diff(REF, 'd'))}</Typography>
            </Grid>
            <Grid item xs={12}>
                <Slider
                    min={moment(min).diff(REF, 'd')}
                    max={moment(max).diff(REF, 'd')}
                    step={1}
                    track={false}
                    value={moment(value).diff(REF, 'd')}
                    onChange={handleChange}
                    onChangeCommitted={onChangeCommitted}
                    valueLabelDisplay='auto'
                    aria-labelledby='range-slider'
                    valueLabelFormat={format}
                />
            </Grid>
        </Grid>
    )

})) /* ============================================================================================================= */
