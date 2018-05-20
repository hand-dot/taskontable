import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import uuid from 'uuid';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Person from '@material-ui/icons/Person';
import People from '@material-ui/icons/People';

import constants from '../constants';
import util from '../util';

const database = util.getDatabase();

const styles = {
  root: {
    minHeight: '100vh',
  },
  content: {
    padding: '6em 2em',
    maxWidth: constants.APPWIDTH,
    margin: '0 auto',
  },
  button: {
    marginTop: 15,
    marginBottom: 15,
    width: '100%',
  },
};


class WorkSheets extends Component {
  constructor(props) {
    super(props);
    this.state = {
      teams: [], // 自分の所属しているチームの一覧
      newTeamName: '',
      isOpenCreateTeamModal: false,
    };
  }

  componentWillMount() {
    database.ref(`/users/${this.props.user.uid}/teams/`).once('value').then((myTeamIds) => {
      if (myTeamIds.exists() && myTeamIds.val() !== []) {
        Promise.all(myTeamIds.val().map(id => database.ref(`/teams/${id}/name/`).once('value'))).then((myTeamNames) => {
          this.setState({ teams: myTeamNames.map((myTeamName, index) => ({ id: myTeamIds.val()[index], name: myTeamName.exists() && myTeamName.val() ? myTeamName.val() : 'Unknown' })) });
        });
      }
    });
  }
  createTeam() {
    if (this.state.newTeamName === '') {
      alert('チーム名が未入力です。');
      return;
    }
    const newTeamId = uuid();
    database.ref(`/users/${this.props.user.uid}/teams/`).set(this.state.teams.map(team => team.id).concat([newTeamId]));
    database.ref(`/teams/${newTeamId}/`).set({ users: [this.props.user.uid], name: this.state.newTeamName });
    this.setState({ teams: this.state.teams.concat([{ id: newTeamId, name: this.state.newTeamName }]), newTeamName: '', isOpenCreateTeamModal: false });
  }

  render() {
    return (
      <Grid className={this.props.classes.root} container spacing={0} alignItems="stretch">
        <Grid item xs={12}>
          <div style={{ minHeight: '100vh' }}>
            <div className={this.props.classes.content}>
              <div style={{ marginBottom: 30 }}>
                <Typography style={{ color: '#fff' }} gutterBottom variant="title">Taskontable(Beta)へようこそ！</Typography>
                <Typography style={{ color: '#fff' }} variant="body2">
                  Tips<span role="img" aria-label="Tips">💡</span>
                </Typography>
                <Typography style={{ color: '#fff' }} gutterBottom variant="body1">
                  もしまだコミュニティに参加されていなければ是非
                  　<a style={{ textDecoration: 'none' }} href={constants.COMMUNITY_URL} target="_blank">slackコミュニティ</a>　に参加してみてください！<br />
                  Beta版ならではの限られた数人のコミュニティにユニークな開発者、ユーザーがいます😜<br />
                  Taskontableの話以外にもいろいろな雑談☕がゆる～く行われています。
                </Typography>
              </div>
              <Divider />
              <div style={{ marginTop: 30 }}>
                <Typography style={{ color: '#fff' }} gutterBottom variant="title">ワークシートの選択</Typography>
                <Typography style={{ color: '#fff' }} gutterBottom variant="caption">ワークシートを選択してください。</Typography>
              </div>
              <div style={{ marginTop: 30 }}>
                <Typography style={{ color: '#fff' }} gutterBottom variant="subheading">
                  <Person />　パーソナルワークシート
                </Typography>
                <Link to={`/${this.props.user.uid}`} style={{ margin: this.props.theme.spacing.unit }}><Button size="small" variant="raised">{this.props.user.displayName}</Button></Link>
              </div>
              <div style={{ marginTop: 30 }}>
                <Typography style={{ color: '#fff' }} gutterBottom variant="subheading">
                  <People />　チームワークシート
                </Typography>
                {this.state.teams.map(team => (
                  <Link key={team.id} to={`/${team.id}`} style={{ padding: this.props.theme.spacing.unit }}><Button size="small" variant="raised">{team.name}</Button></Link>
                ))}
                <div style={{ display: 'inline-block', margin: this.props.theme.spacing.unit }}>
                  <Button size="small" variant="raised" onClick={() => { this.setState({ isOpenCreateTeamModal: true }); }}>+</Button>
                </div>
                <Dialog
                  open={this.state.isOpenCreateTeamModal}
                  onClose={() => { this.setState({ newTeamName: '', isOpenCreateTeamModal: false }); }}
                  aria-labelledby="form-dialog-title"
                >
                  <DialogTitle id="form-dialog-title">チームを作成</DialogTitle>
                  <DialogContent>
                    <TextField
                      onChange={(e) => { this.setState({ newTeamName: e.target.value }); }}
                      value={this.state.newTeamName}
                      autoFocus
                      margin="dense"
                      id="name"
                      label="チーム名"
                      fullWidth
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button size="small" onClick={() => { this.setState({ isOpenCreateTeamModal: false }); }} color="primary">キャンセル</Button>
                    <Button size="small" onClick={this.createTeam.bind(this)} color="primary">作成</Button>
                  </DialogActions>
                </Dialog>
              </div>
            </div>
          </div>
        </Grid>
      </Grid>
    );
  }
}

WorkSheets.propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    photoURL: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
  }).isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(WorkSheets);

