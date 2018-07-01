import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MobileStepper from '@material-ui/core/MobileStepper';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import i18n from '../i18n/';

const tutorialSteps = [
  {
    label: i18n.t('howTouse.createWorksheet'),
    imgPath: 'https://firebasestorage.googleapis.com/v0/b/taskontable.appspot.com/o/assets%2FgettingStarted%2FcreateWorksheet.gif?alt=media&token=7e5af4ad-b112-4e65-bb51-7becac62f0f9',
  },
  {
    label: i18n.t('howTouse.createTask'),
    imgPath: 'https://firebasestorage.googleapis.com/v0/b/taskontable.appspot.com/o/assets%2FgettingStarted%2FcreateTask.gif?alt=media&token=6a715f63-7349-460b-a63a-fcc239ba6285',
  },
  {
    label: i18n.t('howTouse.createTasks'),
    imgPath: 'https://firebasestorage.googleapis.com/v0/b/taskontable.appspot.com/o/assets%2FgettingStarted%2FcreateTasks.gif?alt=media&token=c8dea872-1ebb-4dfb-981a-2ea9f3ffcc3e',
  },
];

const styles = theme => ({
  root: {
    maxWidth: 900,
    flexGrow: 1,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    height: 50,
    paddingLeft: theme.spacing.unit * 4,
    backgroundColor: theme.palette.background.default,
  },
  img: {
    maxWidth: 900,
    overflow: 'hidden',
    width: '100%',
  },
});

class GettingStarted extends React.Component {
  state = {
    activeStep: 0,
  };

  handleNext = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep + 1,
    }));
  };

  handleBack = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep - 1,
    }));
  };

  render() {
    const { classes, theme } = this.props;
    const { activeStep } = this.state;

    const maxSteps = tutorialSteps.length;

    return (
      <div className={classes.root}>
        <Paper square elevation={0} className={classes.header}>
          <Typography>{tutorialSteps[activeStep].label}</Typography>
        </Paper>
        <img
          className={classes.img}
          src={tutorialSteps[activeStep].imgPath}
          alt={tutorialSteps[activeStep].label}
        />
        <MobileStepper
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          className={classes.mobileStepper}
          nextButton={
            <Button size="small" onClick={this.handleNext} disabled={activeStep === maxSteps - 1}>
              {i18n.t('common.next')}
              {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </Button>
          }
          backButton={
            <Button size="small" onClick={this.handleBack} disabled={activeStep === 0}>
              {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
              {i18n.t('common.back')}
            </Button>
          }
        />
      </div>
    );
  }
}

GettingStarted.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(GettingStarted);
