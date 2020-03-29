import { action, reaction } from 'mobx'
import * as React from 'react'
import { hot } from 'react-hot-loader/root'

import { Grid, InputAdornment, Slider, TextField, Tooltip, Typography } from '@material-ui/core'
import IconInfoOutlined from '@material-ui/icons/InfoOutlined'

import { createSmartFC, createStyles, IMyTheme } from '../common/'
import { CONTEXT } from '../stores'
import { IModelArgsExpanded } from '../stores/LocationStore'


const styles = (theme: IMyTheme) => createStyles({
    root: {
        margin: `${theme.spacing(2)}px 0px`,
    },

    input: {
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.spacing(4),
        color: theme.palette.primary.light,
    },
    title: {
    },
    icon: {
        verticalAlign: 'sub',
    }
})


interface IProps {
    argKey: Exclude<keyof IModelArgsExpanded, 'lockdown'>,
    max: number,
    min: number,
    step: number,
    percent?: true,
    title: string,
    tooltip: string,
    format: (value: number) => string,
}

export default hot(createSmartFC(styles)<IProps>(({children, classes, theme, ...props}) => {
    const {percent, title, tooltip, argKey, min, max, step, format} = props
    const locationStore = React.useContext(CONTEXT.LOCATION)
    const piwikStore = React.useContext(CONTEXT.PIWIK)

    const resetState = () => [
        String(locationStore.modelArgs[argKey][0] * (percent ? 100 : 1)),
        String(locationStore.modelArgs[argKey][1] * (percent ? 100 : 1)),
    ]

    const [value, setValue] = React.useState(resetState())
    React.useEffect(() => reaction(() => locationStore.modelArgs, () => {
        setValue(resetState())
    }))

    const onChangeCommitted = action(() => {
        locationStore.modelArgs[argKey] = [
            Number(value[0]) / (percent ? 100 : 1),
            Number(value[1]) / (percent ? 100 : 1),
        ]
        setValue(resetState())
        piwikStore.push([
            'trackEvent',
            'model',
            `argument-${argKey}`,
            (locationStore.modelArgs[argKey][0] + locationStore.modelArgs[argKey][1]) / 2,
            locationStore.modelArgs[argKey][1] - locationStore.modelArgs[argKey][0],
        ])
    })

    const handleChange = (event, newValue) => {
        setValue([String(newValue[0]), String(newValue[1])])
    }
    const handleFromChange = (event) => {
        setValue([event.target.value, String(value[1])])
        if(event.target.value === String(Number(event.target.value)) && value[1] === String(Number(value[1]))) {
            value[0] = event.target.value
            onChangeCommitted()
        }
    }
    const handleToChange = (event) => {
        setValue([String(value[0]), event.target.value])
        if(event.target.value === String(Number(event.target.value)) && value[0] === String(Number(value[0]))) {
            value[1] = event.target.value
            onChangeCommitted()
        }
    }

    const icon = (text: string) => {
        return (<Tooltip title={text}>
                <IconInfoOutlined className={classes.icon} fontSize='small' />
            </Tooltip>)
    }

    const endAdornment = !percent ? undefined : (<InputAdornment position='end'>%</InputAdornment>)

    return (
        <Grid container spacing={1} justify='space-between' alignItems='center' className={classes.root}>
            <Grid item xs={12}>
                <Typography variant='body1'>
                    {title} {icon(tooltip)}
                </Typography>
            </Grid>
            <Grid item xs={5}>
                <TextField
                    size='small'
                    variant='outlined'
                    value={Number(value[0]).toFixed(1)}
                    onChange={handleFromChange}
                    InputProps={{
                        className: classes.input,
                        endAdornment,
                    }}
                />
            </Grid>
            <Grid item xs={2}>
                <Typography align='center'>{'\u2014'}</Typography>
            </Grid>
            <Grid item xs={5}>
                <TextField
                    size='small'
                    variant='outlined'
                    value={Number(value[1]).toFixed(1)}
                    onChange={handleToChange}
                    InputProps={{
                        className: classes.input,
                        endAdornment,
                    }}
                />
            </Grid>
            <Grid item xs={12}>
                <Slider
                    min={min * (percent ? 100 : 1)}
                    max={max * (percent ? 100 : 1)}
                    step={step * (percent ? 100 : 1)}
                    value={[Number(value[0]), Number(value[1])]}
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

