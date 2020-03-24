import * as React from 'react'
import { hot } from 'react-hot-loader/root'

import { createSmartFC, createStyles, IMyTheme } from '../common'
import { useRemountOnRetheme } from './useRemountOnRetheme'

const styles = (theme: IMyTheme) => createStyles({
    root: {
    },
})

interface IProps {
}

export default hot(createSmartFC(styles)<IProps>(({children, classes, theme, ...props}) => {
    const key = useRemountOnRetheme(theme)

    return (<React.Fragment key={key}>{children}</React.Fragment>)

})) /* ============================================================================================================= */
