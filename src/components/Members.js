import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Avatar from 'material-ui/Avatar';
import Typography from 'material-ui/Typography';

const styles = theme => ({
  userPhoto: {
    width: 25,
    height: 25,
  },
});

class Members extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { members, classes } = this.props;
    return (
      <div>
        <Typography variant="subheading">
            メンバー
        </Typography>
        {members.map(member => (
          <div key={member.uid}>
            <Typography variant="caption">{member.displayName}</Typography>
            <Avatar className={classes.userPhoto} src={member.photoURL} />
            <Typography variant="caption">{member.email}</Typography>
          </div>
        ))}
        {/* TODO ここでほかのメンバーを呼ぶ処理を書く */}
        {/* URLをコピーできる機能もあったほうがいい */}
      </div>
    );
  }
}

Members.propTypes = {
  members: PropTypes.arrayOf(PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    photoURL: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  })).isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};
export default withStyles(styles, { withTheme: true })(Members);

