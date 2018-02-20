import { createMuiTheme } from 'material-ui/styles';
// https://material-ui-next.com/customization/themes/
// https://material-ui-next.com/customization/theme-default/
const theme = createMuiTheme({
  palette: {
    // type: 'dark',
  },
  mixins: {
    toolbar: {
      minHeight: 48,
      '@media (min-width:0px) and (orientation: landscape)': {
        minHeight: 48,
      },
      '@media (min-width:600px)': {
        minHeight: 48,
      },
    },
  },
});

export default theme;
