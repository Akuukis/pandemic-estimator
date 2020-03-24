import { TypographyOptions, TypographyStyleOptions } from '@material-ui/core/styles/createTypography'

import { IMyThemeOptions } from './Types'

export const DEFAULT_FONT_FAMILY = `'HelveticaNeue', 'Helvetica', 'Arial', sans-serif`
export const MONO_FONT_FAMILY = `'Helvetica Monospaced', monospace`

export const commonThemeOptions: IMyThemeOptions = {
    spacing: 8,  // Default.

    fontFamily: {
        default: DEFAULT_FONT_FAMILY,
        mono: MONO_FONT_FAMILY,
    },

    overrides: {
        MuiPaper: {
            root: {
                backgroundColor: 'transparent',
            },
        },
    },

    typography: {
        body1: {
            fontSize: '1rem',
        } as TypographyStyleOptions,
        body2: {
            fontSize: '1.15rem',
            textAlign: 'left',
        } as TypographyStyleOptions,
        button: {
            textTransform: 'none',
        } as TypographyStyleOptions,
        caption: {
            fontSize: '1rem',
            fontWeight: 700,
            margin: '20px 0 0',
        } as TypographyStyleOptions,
        fontFamily: DEFAULT_FONT_FAMILY,
        fontSize: 14,
        h1: {
            fontSize: '2.4rem',
            fontWeight: 500,
            letterSpacing: '10px',
        } as TypographyStyleOptions,
        h2: {
            fontSize: '2rem',
            fontWeight: 500,
            gutterBottom: {
                marginBottom: '30px',
            },
            lineHeight: 1.25,
        } as TypographyStyleOptions,
        h3: {
            fontSize: '1.8rem',
            fontWeight: 300,
        } as TypographyStyleOptions,
        h4: {
            fontSize: '1.3rem',
            fontWeight: 300,
        } as TypographyStyleOptions,
        h5: {
            fontSize: '1rem',
            fontWeight: 300,
        } as TypographyStyleOptions,
        h6: {
            fontSize: '0.875rem',
            fontWeight: 300,
        } as TypographyStyleOptions,
        subtitle1: {
            fontSize: '1.3rem',
            fontWeight: 400,
        } as TypographyStyleOptions,
    } as TypographyOptions,
}
