import { TypographyOptions, TypographyStyleOptions } from '@material-ui/core/styles/createTypography'


import { DEFAULT_FONT_FAMILY, MONO_FONT_FAMILY, commonThemeOptions } from './common'
import { IMyThemeOptions } from './Types'

const commonTypography = commonThemeOptions.typography as TypographyOptions
// tslint:disable: no-object-literal-type-assertion
const lightTheme: IMyThemeOptions = {
    ...commonThemeOptions,
    overrides: {
        ...commonThemeOptions.overrides,
        MuiDivider: {
            root: {
                backgroundColor: '#000000',
                height: '1px',
            },
        },
        MuiFormControlLabel: {
            label: {
                color: '#000000',
                fontFamily: MONO_FONT_FAMILY,
                fontSize: '0.875rem', // 14px
                marginTop: '2.5px',
            },
            root: {
                alignItems: 'end',
                marginLeft: '-5px',
            },
        },
        MuiFormLabel: {
            root: {
                color: '#000000',
                fontFamily: DEFAULT_FONT_FAMILY,
                fontSize: '0.875rem', // 14px
            },
        },

        MuiBackdrop: {
            root: {
                backgroundColor: 'rgba(33,34,62,0.3)',
            },
        },

    },

    palette: {
        primary: {
            main: '#000000',
        },
        text: {
            primary: '#000000',
            secondary: '#000000',
        },
        type: 'light',
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

export default lightTheme
