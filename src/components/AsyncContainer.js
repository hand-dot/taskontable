import React from 'react';

export default (loader, collection) => (
  class AsyncContainer extends React.Component {
    constructor(props) {
      super(props);
      this.state = { Container: AsyncContainer.Container };
    }

    componentWillMount() {
      if (!this.state.Container) {
        loader().then((Container) => {
          this.setState({ Container });
        });
      }
    }

    render() {
      if (this.state.Container) {
        return (
          <this.state.Container {...this.props} {...collection} />
        );
      }
      return null;
    }
  }
);

