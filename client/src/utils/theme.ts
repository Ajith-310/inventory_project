import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#000000',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    divider: '#424242',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 300,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 300,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 400,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 400,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 400,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e1e1e',
          borderRight: '1px solid #424242',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#2d2d2d',
          border: '1px solid #424242',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#2d2d2d',
          border: '1px solid #424242',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          },
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#1e1e1e',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2196f3',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2196f3',
            },
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          '& .MuiTableCell-head': {
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
            fontWeight: 600,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #424242',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#2d2d2d',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiSnackbarContent-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

export default theme; 