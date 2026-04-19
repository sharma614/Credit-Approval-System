/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Surfaces ────────────────────────────────────────────────────────
        surface:                    '#001205',
        'surface-dim':              '#001205',
        'surface-bright':           '#003417',
        'surface-container-lowest': '#000000',
        'surface-container-low':    '#001807',
        'surface-container':        '#001f0b',
        'surface-container-high':   '#00260f',
        'surface-container-highest':'#002d13',
        'surface-variant':          '#002d13',
        'surface-tint':             '#81fd77',
        // ── Primary (green) ────────────────────────────────────────────────
        primary:                    '#81fd77',
        'primary-dim':              '#73ee6b',
        'primary-fixed':            '#81fd77',
        'primary-fixed-dim':        '#73ee6b',
        'primary-container':        '#3ab83c',
        'on-primary':               '#00600e',
        'on-primary-fixed':         '#004b09',
        'on-primary-fixed-variant': '#006b11',
        'on-primary-container':     '#002a03',
        'inverse-primary':          '#006f12',
        // ── Secondary (mint) ────────────────────────────────────────────────
        secondary:                  '#87f7a6',
        'secondary-dim':            '#79e899',
        'secondary-fixed':          '#87f7a6',
        'secondary-fixed-dim':      '#79e899',
        'secondary-container':      '#006d36',
        'on-secondary':             '#005d2d',
        'on-secondary-fixed':       '#004822',
        'on-secondary-fixed-variant':'#006833',
        'on-secondary-container':   '#e3ffe4',
        // ── Tertiary (cyan) ─────────────────────────────────────────────────
        tertiary:                   '#97f4ff',
        'tertiary-dim':             '#00deef',
        'tertiary-fixed':           '#1aedff',
        'tertiary-fixed-dim':       '#00deef',
        'tertiary-container':       '#1aedff',
        'on-tertiary':              '#005d64',
        'on-tertiary-fixed':        '#003f44',
        'on-tertiary-fixed-variant':'#005e65',
        'on-tertiary-container':    '#00535a',
        // ── Text ────────────────────────────────────────────────────────────
        'on-surface':               '#cffcd4',
        'on-surface-variant':       '#8bb591',
        'inverse-surface':          '#eaffea',
        'inverse-on-surface':       '#365d40',
        // ── Background ──────────────────────────────────────────────────────
        background:                 '#001205',
        'on-background':            '#cffcd4',
        // ── Outline ─────────────────────────────────────────────────────────
        outline:                    '#567f5e',
        'outline-variant':          '#295033',
        // ── Error ───────────────────────────────────────────────────────────
        error:                      '#ff7351',
        'error-dim':                '#d53d18',
        'error-container':          '#b92902',
        'on-error':                 '#450900',
        'on-error-container':       '#ffd2c8',
      },
      fontFamily: {
        headline: ['Inter', 'sans-serif'],
        body:     ['Inter', 'sans-serif'],
        label:    ['Inter', 'sans-serif'],
        display:  ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg:   '0.25rem',
        xl:   '0.5rem',
        '2xl':'1rem',
        '3xl':'1.5rem',
        full: '9999px',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
