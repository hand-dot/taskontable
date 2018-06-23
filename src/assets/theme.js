import { createMuiTheme } from '@material-ui/core/styles';
import constants from '../constants';
// https://@material-ui/core-next.com/customization/themes/
// https://@material-ui/core-next.com/customization/default-theme/
const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#eee',
      main: '#999',
      // dark: will be calculated from palette.primary.main,
      contrastText: '#fff',
    },
    secondary: {
      light: constants.brandColor.light.GREY,
      main: constants.brandColor.base.GREY,
      // dark: will be calculated from palette.secondary.main,
      contrastText: '#fff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.9)',
      secondary: 'rgba(0, 0, 0, 0.7)',
    },
    typography: {
      // Use the system font instead of the default Roboto font.
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
    },
    // error: will us the default color
  },
  mixins: {
    toolbar: {
      minHeight: 40,
      '@media (min-width:0px) and (orientation: landscape)': {
        minHeight: 40,
      },
      '@media (min-width:600px)': {
        minHeight: 40,
      },
    },
  },
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  duration: {
    shortest: 0,
    shorter: 50,
    short: 100,
    standard: 150,
    complex: 225,
    enteringScreen: 75,
    leavingScreen: 45,
  },
});

export default theme;
