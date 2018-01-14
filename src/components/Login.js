import React from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';

function Login(props) {
  const { login } = props;
  return (<div>
    <Button onClick={login} raised>グーグルアカウントでログインする</Button>
  </div>);
}

Login.propTypes = {
  login: PropTypes.func.isRequired,
};

export default Login;
