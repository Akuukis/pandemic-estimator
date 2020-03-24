import * as React from 'react'
import { hot } from 'react-hot-loader/root'
import { useHistory } from 'react-router-dom'

import { Button } from '@material-ui/core'

import { createSmartFC, createStyles, IMyTheme } from '../../common/'
import { ROUTES } from '../../constants/routes'
import { CONTEXT } from '../../stores'


const styles = (theme: IMyTheme) => createStyles({
    root: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        minWidth: 56,
    },
})


interface IProps {
    route: ROUTES
    children: JSX.Element
}

export default hot(createSmartFC(styles)<IProps>(({children, classes, theme, ...props}) => {
    const piwikStore = React.useContext(CONTEXT.PIWIK)
    const history = useHistory()

    const h = (event: React.MouseEvent) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const path = event.currentTarget.getAttribute('value')!
        history.push(path)
        piwikStore.track({path})
    }

    return (
        <Button
            variant='text'
            className={classes.root}
            onClick={h}
            value={props.route}
        >
            {children}
        </Button>
    )
})) /* ============================================================================================================= */
