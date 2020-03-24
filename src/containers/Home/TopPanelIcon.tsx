import * as React from 'react'
import { hot } from 'react-hot-loader/root'

import { Paper, Tooltip, Typography } from '@material-ui/core'
import IconInfoOutlined from '@material-ui/icons/InfoOutlined'

import { createSmartFC, createStyles, IMyTheme } from '../../common/'


const styles = (theme: IMyTheme) => createStyles({
    root: {
        height: `calc(100% - 1px - 2 * ${theme.spacing(2)}px)`,
        padding: `${theme.spacing(2)}px ${theme.spacing(2)}px`,
        borderColor: theme.palette.background.paper,
        borderWidth: '0px 1px 1px 0px',
        borderStyle: 'solid',
    },
    icon: {
        verticalAlign: 'text-bottom',
    }
})


interface IProps {
    value: string | JSX.Element,
    title: string | JSX.Element,
    tooltip?: string,
    color: string,
}


export default hot(createSmartFC(styles)<IProps>(({children, classes, theme, ...props}) => {
    const {title, tooltip, value, color} = props

    const icon = (text: string) => {
        return (<Tooltip title={text}>
                <IconInfoOutlined className={classes.icon} fontSize='small' />
            </Tooltip>)
    }

    return (
        <Paper square className={classes.root}>
            <Typography variant='h4'>{value}</Typography>
            <Typography variant='body1'>
                <span style={{textDecoration: 'underline', textDecorationColor: color}}>{title}</span>
                &nbsp;
                {tooltip === undefined ? null : icon(tooltip)}
            </Typography>
        </Paper>
    )
})) /* ============================================================================================================= */
