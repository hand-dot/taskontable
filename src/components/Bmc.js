import React from 'react';
import PropTypes from 'prop-types';
import '../styles/bmc.css';

function Bmc(props) {
  const { id } = props;
  return (
    <a className="bmc-button" target="_blank" rel="noreferrer noopener" href={`https://www.buymeacoffee.com/${id}`}>
      <img src="https://www.buymeacoffee.com/assets/img/BMC-btn-logo.svg" alt="Buy me a coffee" />
      <span style={{ marginLeft: 5 }}>
        Buy me a coffee
      </span>
    </a>
  );
}

Bmc.propTypes = {
  id: PropTypes.string.isRequired,
};

export default Bmc;
