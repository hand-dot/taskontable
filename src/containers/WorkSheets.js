import * as firebase from 'firebase';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import uuid from 'uuid';
import Dialog, { DialogContent, DialogTitle, DialogActions } from 'material-ui/Dialog';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import constants from '../constants';

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

const database = firebase.database();

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
          <Paper style={{ minHeight: '100vh' }} square elevation={0}>
            <div className={this.props.classes.content}>
              <Typography variant="title">
            ワークシートの選択
              </Typography>
              <Typography gutterBottom variant="caption">
            ワークシートを選択してください。
              </Typography>
              <div style={{ marginTop: 30 }}>
                <Typography variant="subheading" gutterBottom>
                  <i className="fa fa-user" aria-hidden="true" />　パーソナルワークシート
                </Typography>
                <Link to={`/${this.props.user.uid}`}><Button variant="raised">{this.props.user.displayName}</Button></Link>
              </div>
              <div style={{ marginTop: 30 }}>
                <Typography variant="subheading" gutterBottom>
                  <i className="fa fa-users" aria-hidden="true" />　チーム
                </Typography>
                {this.state.teams.map(team => (
                  <Link key={team.id} to={`/${team.id}`} style={{ padding: this.props.theme.spacing.unit }}><Button variant="raised">{team.name}</Button></Link>
                ))}
                <span style={{ padding: this.props.theme.spacing.unit }}>
                  <Button variant="raised" onClick={() => { this.setState({ isOpenCreateTeamModal: true }); }}>+</Button>
                </span>
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
                    <Button onClick={() => { this.setState({ isOpenCreateTeamModal: false }); }} color="primary">キャンセル</Button>
                    <Button onClick={this.createTeam.bind(this)} color="primary">作成</Button>
                  </DialogActions>
                </Dialog>
              </div>
            </div>
          </Paper>
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

