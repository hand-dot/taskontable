import React from 'react';
import PropTypes from 'prop-types';

function GithubStart(props) {
  const {
    title, user, repo, size, width, height,
  } = props;
  return (
    <iframe title={title} src={`https://ghbtns.com/github-btn.html?user=${user}&repo=${repo}&type=star&count=true&size=${size}`} width={width} height={height} frameBorder="0" scrolling="0" />
  );
}

GithubStart.propTypes = {
  title: PropTypes.string.isRequired,
  user: PropTypes.string.isRequired,
  repo: PropTypes.string.isRequired,
  size: PropTypes.string.isRequired,
  width: PropTypes.string.isRequired,
  height: PropTypes.string.isRequired,
};

export default GithubStart;
