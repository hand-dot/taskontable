import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MobileStepper from '@material-ui/core/MobileStepper';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import i18n from '../i18n';

const tutorialSteps = [
  {
    label: i18n.t('howTouse.createWorksheet'),
    resourcePath: 'https://firebasestorage.googleapis.com/v0/b/taskontable.appspot.com/o/assets%2FgettingStarted%2FcreateWorksheet.mp4?alt=media&token=8f22b641-6090-4f3a-8e6c-fa1e567c8703',
  },
  {
    label: i18n.t('howTouse.createTask'),
    resourcePath: 'https://firebasestorage.googleapis.com/v0/b/taskontable.appspot.com/o/assets%2FgettingStarted%2FcreateTask.mp4?alt=media&token=4b94cbc0-3254-4e14-87f8-bf9fcc135e00',
  },
  {
    label: i18n.t('howTouse.createTasks'),
    resourcePath: 'https://firebasestorage.googleapis.com/v0/b/taskontable.appspot.com/o/assets%2FgettingStarted%2FcreateTasks.mp4?alt=media&token=6beeab1b-5771-4cd8-b54a-b6a94b38a11e',
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
    minHeight: 50,
    paddingLeft: theme.spacing.unit * 4,
    backgroundColor: theme.palette.background.default,
  },
  video: {
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
          <Typography>
            {tutorialSteps[activeStep].label}
          </Typography>
        </Paper>
        <video
          autoPlay
          loop
          muted
          playsInline
          className={classes.video}
          track={tutorialSteps[activeStep].label}
          src={tutorialSteps[activeStep].resourcePath}
          type="video/mp4"
        />
        <MobileStepper
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          className={classes.mobileStepper}
          nextButton={(
            <Button size="small" onClick={this.handleNext} disabled={activeStep === maxSteps - 1}>
              {i18n.t('common.next')}
              {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </Button>
          )}
          backButton={(
            <Button size="small" onClick={this.handleBack} disabled={activeStep === 0}>
              {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
              {i18n.t('common.back')}
            </Button>
          )}
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
