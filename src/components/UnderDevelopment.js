import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import constants from '../constants';
import i18n from '../i18n';

function UnderDevelopment(props) {
  const { theme } = props;
  return (
    <div
      style={{
        padding: `0 ${theme.spacing.unit}px`,
        display: 'inline-block',
        backgroundColor: constants.brandColor.light.YELLOW,
        borderLeft: `5px ${constants.brandColor.base.YELLOW} solid`,
        }}
    >
      <p>
        <span role="img" aria-label="stop">⛔</span>
        {i18n.t('common.underDevelopment')}
      </p>
    </div>
  );
}

UnderDevelopment.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles({}, { withTheme: true })(UnderDevelopment);

