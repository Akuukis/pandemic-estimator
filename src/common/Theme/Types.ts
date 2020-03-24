import { DeepPartial } from 'utility-types'

import { Theme, ThemeOptions } from '@material-ui/core/styles/createMuiTheme'

interface ICustomTheme {
    fontFamily: {
        default: string
        mono: string
    }
}


export interface IMyTheme extends ICustomTheme, Theme {}
export interface IMyThemeOptions extends DeepPartial<ICustomTheme>, ThemeOptions {}
