import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Dialog, { DialogContent, DialogTitle, DialogActions } from 'material-ui/Dialog';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';

const styles = {
  root: {
    minHeight: '100vh',
  },
  content: {
    padding: '6em 2em',
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
      isOpenCreateTeamModal: false,
    };
  }

  componentWillMount() {
    // TODO ここで自分の所属しているチームを取得する
  }
  createTeam() {
    console.log('!');
    // TODO ここで自分のチームのリストに作ったチームを追加する
  }

  render() {
    return (
      <Grid className={this.props.classes.root} container spacing={0} alignItems="stretch">
        <Grid item xs={12}>
          <Paper style={{ minHeight: '100vh' }} square elevation={0}>
            <div className={this.props.classes.content}>
              <Typography variant="headline" gutterBottom>
              ワークシートの選択
              </Typography>
              <div style={{ marginTop: 30 }}>
                <Typography variant="subheading" gutterBottom>
                  <i className="fa fa-user" aria-hidden="true" />　パーソナルワークシート
                </Typography>
                <Link to={`/${this.props.id}`}><Button variant="raised">{this.props.displayName}</Button></Link>
              </div>
              <div style={{ marginTop: 30 }}>
                <Typography variant="subheading" gutterBottom>
                  <i className="fa fa-users" aria-hidden="true" />　チーム
                </Typography>
                {/* TODO ここで自分が所属しているチームの一覧を回し、下記のリンクを生成する */}
                {/* {this.state.teams.map((team, index) => ( */}
                {/*   <Link to={`/${team.id}`}><Button variant="raised">{team.name}</Button></Link> */}
                {/* ))} */}
                <div>
                  <Button variant="raised" onClick={() => { this.setState({ isOpenCreateTeamModal: true }); }}>+</Button>
                  <Dialog
                    open={this.state.isOpenCreateTeamModal}
                    onClose={() => { this.setState({ isOpenCreateTeamModal: false }); }}
                    aria-labelledby="form-dialog-title"
                  >
                    <DialogTitle id="form-dialog-title">チームを作成</DialogTitle>
                    <DialogContent>
                      <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="チーム名"
                        fullWidth
                      />
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => { this.setState({ isOpenCreateTeamModal: false }); }} color="primary">キャンセル</Button>
                      <Button onClick={this.createTeam} color="primary">作成</Button>
                    </DialogActions>
                  </Dialog>
                </div>
              </div>
            </div>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

WorkSheets.propTypes = {
  id: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles)(WorkSheets);

