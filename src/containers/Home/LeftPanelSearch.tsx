import * as React from 'react'
import { hot } from 'react-hot-loader/root'
import matchSorter from 'match-sorter';

import { Grid, InputAdornment, TextField } from '@material-ui/core'
import { Autocomplete } from '@material-ui/lab'
import IconSearchOutlined from '@material-ui/icons/SearchOutlined'

import { createSmartFC, createStyles, IMyTheme } from '../../common/'
import { CONTEXT } from '../../stores'

const styles = (theme: IMyTheme) => createStyles({
    root: {
        marginBottom: theme.spacing(2),
    },
    location: {
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.spacing(4),
        color: theme.palette.primary.light,
    },
    icon: {
        color: theme.palette.primary.main,
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
    }
})


interface IProps {
}


export default hot(createSmartFC(styles)<IProps>(({children, classes, theme, ...props}) => {
    const domainStore = React.useContext(CONTEXT.DOMAIN)

    const filterOptions = (options, { inputValue }) => {
        return matchSorter(options, inputValue);
    }

    return (
        <Grid container spacing={1} justify='space-between' alignItems='center' className={classes.root}>
            {/* <Grid item xs={12}>
                <Typography variant='body1'>Country</Typography>
            </Grid> */}
            <Grid item xs={12}>
                <Autocomplete
                    size='small'
                    blurOnSelect
                    selectOnFocus
                    id="combo-box-demo"
                    classes={{paper: classes.paper}}
                    options={domainStore.domainNames}
                    getOptionLabel={option => option[1]}
                    filterOptions={filterOptions}
                    value={domainStore.domainNames.find((domain) => domain[0] === domainStore.selector) || domainStore.selector}
                    onChange={(event, value)=>domainStore.setSelectedDomain(value)}
                    renderInput={(params) => (<TextField {...params} variant="outlined" InputProps={{
                            ...params.InputProps,
                            className: classes.location,
                            startAdornment: (<InputAdornment position='start'>
                                    <IconSearchOutlined className={classes.icon} />
                                </InputAdornment>),
                        }}/>
                    )}
                />
            </Grid>
        </Grid>
    )
})) /* ============================================================================================================= */
