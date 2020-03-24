import { useLayoutEffect, useState } from 'react'

import { IMyTheme } from '../common/myTheme'

/**
 * Returns key that must be used on component that is to be remounted
 */
export const useRemountOnRetheme = (theme: IMyTheme) => {
    const [key, setKey] = useState(theme.palette.type)

    // To cut transitions, Layout effect is needed.
    useLayoutEffect(() => {
        if(theme.palette.type !== key) setKey(theme.palette.type)
    })

    return key
}
