import { action } from 'mobx'
import * as React from 'react'
import { hot } from 'react-hot-loader/root'

import { Button, Typography } from '@material-ui/core'

import { createSmartFC, createStyles, IMyTheme } from '../../common/'
import { CONTEXT } from '../../stores'
import { DomainStore } from '../../stores/DomainStore'


const styles = (theme: IMyTheme) => createStyles({
    root: {
    },
    title: {
    },
})


interface IProps {
}

export default hot(createSmartFC(styles)<IProps>(({children, classes, theme, ...props}) => {
    const domainStore = React.useContext(CONTEXT.DOMAIN)

    const reset = action(() => {
        domainStore.modelArgs = DomainStore.DEFAULT_ARGS
    })

    return (
        <Button
            variant='text'
            className={classes.root}
            onClick={reset}
        >
            <Typography
                className={classes.title}
                variant='button'
            >
                Reset
            </Typography>
        </Button>
    )
})) /* ============================================================================================================= */
