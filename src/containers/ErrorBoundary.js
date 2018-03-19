import Raven from 'raven-js';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
// https://docs.sentry.io/clients/javascript/integrations/react/#expanded-usage
// https://reactjs.org/blog/2017/07/26/error-handling-in-react-16.html
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });
    // You can also log the error to an error reporting service
    Raven.captureException(error, { extra: info });
  }
  // TODO デザインを考える
  render() {
    if (this.state.hasError) {
      // render fallback UI
      return (
        <div
          className="snap"
          onClick={() => Raven.lastEventId() && Raven.showReportDialog()}
        >
          {/* <img src={oops} /> */}
          <p>We're sorry — something's gone wrong.</p>
          <p>Our team has been notified, but click here fill out a report.</p>
        </div>
      );
    }
    // when there's not an error, render children untouched
    return this.props.children;
  }
}
ErrorBoundary.propTypes = {
    children: PropTypes.object.isRequired, // eslint-disable-line
};
export default ErrorBoundary;
