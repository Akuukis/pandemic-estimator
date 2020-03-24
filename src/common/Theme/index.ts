import { createMuiTheme } from '@material-ui/core/styles'

import darkTheme from './Dark'
import lightTheme from './Light'
import { IMyTheme } from './Types'

export const LIGHT_THEME = createMuiTheme(lightTheme) as IMyTheme
export const DARK_THEME = createMuiTheme(darkTheme) as IMyTheme
export { IMyTheme } from './Types'
