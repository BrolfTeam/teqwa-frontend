export const theme = {
  // Designer-friendly high-level palette for quick references across the app
  palette: {
    islamic: {
      green: {
        DEFAULT: 'hsl(164, 80%, 37%)', // brand primary
        50: 'hsl(164, 80%, 97%)',
        100: 'hsl(164, 80%, 90%)',
        200: 'hsl(164, 80%, 80%)',
        300: 'hsl(164, 80%, 70%)',
        400: 'hsl(164, 80%, 50%)',
        500: 'hsl(164, 80%, 37%)',
        700: 'hsl(164, 80%, 25%)',
      },
      gold: {
        DEFAULT: 'hsl(42, 64%, 60%)',
        300: 'hsl(42, 64%, 70%)',
        400: 'hsl(42, 64%, 60%)',
        500: 'hsl(42, 64%, 50%)',
      },
      neutral: {
        white: '#ffffff',
        paper: 'hsl(0, 0%, 98%)',
        muted: 'hsl(0, 0%, 96%)',
        text: 'hsl(0, 0%, 13%)',
      },
      dark: {
        background: 'hsl(0, 0%, 8%)',
        surface: 'hsl(0, 0%, 12%)',
        mutedText: 'hsl(0, 0%, 60%)',
      },
    },
  },
  colors: {
    // Brand colors
    primary: {
      DEFAULT: 'hsl(164, 80%, 37%)', // #0B6B51
      foreground: 'hsl(0, 0%, 100%)',
      50: 'hsl(164, 80%, 97%)',
      100: 'hsl(164, 80%, 90%)',
      200: 'hsl(164, 80%, 80%)',
      300: 'hsl(164, 80%, 70%)',
      400: 'hsl(164, 80%, 50%)',
      500: 'hsl(164, 80%, 37%)',
      600: 'hsl(164, 80%, 30%)',
      700: 'hsl(164, 80%, 25%)',
      800: 'hsl(164, 80%, 20%)',
      900: 'hsl(164, 80%, 15%)',
      950: 'hsl(164, 80%, 10%)',
    },
    secondary: {
      DEFAULT: 'hsl(198, 73%, 12%)', // #092A3A
      foreground: 'hsl(0, 0%, 100%)',
      50: 'hsl(198, 73%, 97%)',
      100: 'hsl(198, 73%, 90%)',
      200: 'hsl(198, 73%, 80%)',
      300: 'hsl(198, 73%, 70%)',
      400: 'hsl(198, 73%, 50%)',
      500: 'hsl(198, 73%, 12%)',
      600: 'hsl(198, 73%, 10%)',
      700: 'hsl(198, 73%, 8%)',
      800: 'hsl(198, 73%, 6%)',
      900: 'hsl(198, 73%, 4%)',
    },
    accent: {
      DEFAULT: 'hsl(42, 64%, 60%)', // #C9A44A
      foreground: 'hsl(0, 0%, 100%)',
      50: 'hsl(42, 64%, 97%)',
      100: 'hsl(42, 64%, 90%)',
      200: 'hsl(42, 64%, 80%)',
      300: 'hsl(42, 64%, 70%)',
      400: 'hsl(42, 64%, 60%)',
      500: 'hsl(42, 64%, 50%)',
      600: 'hsl(42, 64%, 40%)',
      700: 'hsl(42, 64%, 30%)',
      800: 'hsl(42, 64%, 20%)',
      900: 'hsl(42, 64%, 10%)',
    },

    // Semantic colors
    success: {
      DEFAULT: 'hsl(142, 76%, 36%)',
      foreground: 'hsl(0, 0%, 100%)',
    },
    warning: {
      DEFAULT: 'hsl(38, 92%, 50%)',
      foreground: 'hsl(0, 0%, 100%)',
    },
    error: {
      DEFAULT: 'hsl(0, 84%, 60%)',
      foreground: 'hsl(0, 0%, 100%)',
    },
    info: {
      DEFAULT: 'hsl(199, 89%, 48%)',
      foreground: 'hsl(0, 0%, 100%)',
    },

    // Grayscale
    gray: {
      50: 'hsl(0, 0%, 98%)',
      100: 'hsl(0, 0%, 96%)',
      200: 'hsl(0, 0%, 93%)',
      300: 'hsl(0, 0%, 88%)',
      400: 'hsl(0, 0%, 74%)',
      500: 'hsl(0, 0%, 62%)',
      600: 'hsl(0, 0%, 46%)',
      700: 'hsl(0, 0%, 38%)',
      800: 'hsl(0, 0%, 26%)',
      900: 'hsl(0, 0%, 13%)',
    },

    // Background colors
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(0, 0%, 13%)',
    muted: 'hsl(0, 0%, 96%)',
    'muted-foreground': 'hsl(0, 0%, 46%)',
    border: 'hsl(0, 0%, 88%)',
    input: 'hsl(0, 0%, 88%)',
    ring: 'hsl(164, 80%, 37%)',
  },

  // Typography
  fontFamily: {
    sans: ['Inter', 'sans-serif'],
    arabic: ['Tajawal', 'sans-serif'],
    quran: ['Amiri Quran', 'serif'],
    mono: ['Roboto Mono', 'monospace'],
  },

  // Border radius
  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  // Box shadow
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
  },

  // Animation
  animation: {
    none: 'none',
    spin: 'spin 1s linear infinite',
    ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    bounce: 'bounce 1s infinite',
    'fade-in': 'fadeIn 0.3s ease-in-out',
    'fade-out': 'fadeOut 0.3s ease-in-out',
    'slide-up': 'slideUp 0.3s ease-in-out',
    'slide-down': 'slideDown 0.3s ease-in-out',
  },

  // Keyframes
  keyframes: {
    fadeIn: {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 },
    },
    fadeOut: {
      '0%': { opacity: 1 },
      '100%': { opacity: 0 },
    },
    slideUp: {
      '0%': { transform: 'translateY(20px)', opacity: 0 },
      '100%': { transform: 'translateY(0)', opacity: 1 },
    },
    slideDown: {
      '0%': { transform: 'translateY(-20px)', opacity: 0 },
      '100%': { transform: 'translateY(0)', opacity: 1 },
    },
  },

  // Z-index
  zIndex: {
    auto: 'auto',
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
  },

  // Spacing
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },

  // Breakpoints
  screens: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

export default theme;
