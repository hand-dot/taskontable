import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';

import i18n from '../i18n';

function NotLoginSection(props) {
  const { theme } = props;
  return (
    <Typography align="center" variant="subtitle1">
      <span role="img" aria-label="HandWave">
      👋
      </span>
      {i18n.t('worksheet.doYouHaveATaskontableAccount')}
      <Link style={{ margin: theme.spacing.unit }} to="/signup">
        {i18n.t('common.signUp')}
      </Link>
      {i18n.t('common.or')}
      <Link style={{ margin: theme.spacing.unit }} to="/">
        {i18n.t('worksheet.showMoreAboutTaskontable')}
      </Link>
    </Typography>
  );
}

NotLoginSection.propTypes = {
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles({}, { withTheme: true })(NotLoginSection);
