import { TypographyOptions, TypographyStyleOptions } from '@material-ui/core/styles/createTypography'

import { DEFAULT_FONT_FAMILY, MONO_FONT_FAMILY, commonThemeOptions } from './common'
import { IMyThemeOptions } from './Types'

const commonTypography = commonThemeOptions.typography as TypographyOptions
// tslint:disable: no-object-literal-type-assertion
const darkTheme: IMyThemeOptions = {
    ...commonThemeOptions,

    overrides: {
        ...commonThemeOptions.overrides,
        MuiDivider: {
            root: {
                backgroundColor: '#ffffff',
                height: '1px',
            },
        },
        MuiFormControlLabel: {
            label: {
                color: '#ffffff',
                fontFamily: MONO_FONT_FAMILY,
                fontSize: '0.875rem',
                marginTop: '2.5px',
            },
            root: {
                alignItems: 'end',
                marginLeft: '-5px',
            },
        },
        MuiFormLabel: {
            root: {
                color: '#ffffff',
                fontFamily: DEFAULT_FONT_FAMILY,
                fontSize: '0.875rem',
            },
        },

        MuiTable: {
            root: {
                background: '#1A1A1A',
            },
        },

        MuiBackdrop: {
            root: {
                backgroundColor: 'rgba(25,25,25,0.3)',
            },
        },
    },

    palette: {
        primary: {
            main: '#A3A3A3',
            light: '#FFFFFF',
            dark: '#6A6A6A',
        },
        background: {
            default: 'black',
            paper: '#242424',
        },
        text: {
            primary: '#A3A3A3',
            secondary: '#6A6A6A',
            disabled: '#6A6A6A',
        },
        type: 'dark',
    },

    typography: {
        ...commonTypography,
        caption     : { ...commonTypography.caption    , color: '#ffffff' } as TypographyStyleOptions,
        h1          : { ...commonTypography.h1         , color: '#ffffff' } as TypographyStyleOptions,
        h2          : { ...commonTypography.h2         , color: '#ffffff' } as TypographyStyleOptions,
        h3          : { ...commonTypography.h3         , color: '#ffffff' } as TypographyStyleOptions,
        h4          : { ...commonTypography.h4         , color: '#ffffff' } as TypographyStyleOptions,
        h5          : { ...commonTypography.h5         , color: '#ffffff' } as TypographyStyleOptions,
        h6          : { ...commonTypography.h6         , color: '#ffffff' } as TypographyStyleOptions,
        subtitle1   : { ...commonTypography.subtitle1  , color: '#ffffff' } as TypographyStyleOptions,
    },
}

export default darkTheme
