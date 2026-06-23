import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { colors } from './design-tokens'

export const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'ktxLight',
    themes: {
      ktxLight: {
        dark: false,
        colors: {
          primary: colors.primary,
          'primary-lighten-1': colors.primaryLight,
          'primary-darken-1': colors.primaryDark,
          secondary: colors.secondary,
          'secondary-lighten-1': colors.secondaryLight,
          accent: colors.accent,
          success: colors.success,
          warning: colors.warning,
          error: colors.error,
          info: colors.info,
          background: colors.background,
          surface: colors.surface,
          'surface-variant': colors.surfaceVariant,
          'on-surface': colors.onSurface,
        },
      },
    },
  },
  defaults: {
    VCard: {
      rounded: 'lg',
      elevation: 0,
    },
    VBtn: {
      rounded: 'lg',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VDataTableServer: {
      itemsPerPageOptions: [
        { value: 10, title: '10' },
        { value: 20, title: '20' },
        { value: 50, title: '50' },
      ],
    },
  },
})
