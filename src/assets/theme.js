import { createMuiTheme } from 'material-ui/styles';
import constants from '../constants';
// https://material-ui-next.com/customization/themes/
// https://material-ui-next.com/customization/theme-default/
const theme = createMuiTheme({
  palette: {
    primary: {
      light: constants.brandColor.light.BLUE,
      main: constants.brandColor.base.BLUE,
      // dark: will be calculated from palette.primary.main,
      contrastText: '#fff',
    },
    secondary: {
      light: constants.brandColor.light.PURPLE,
      main: constants.brandColor.base.PURPLE,
      // dark: will be calculated from palette.secondary.main,
      contrastText: '#fff',
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
