import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';

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
  link: {
    textDecoration: 'none',
  },
};


class WorkSheetList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      worksheets: [], // 自分の所属しているワークシートの一覧
      newWorksheetName: '',
      isOpenCreateWorksheetModal: false,
    };
  }

  componentWillMount() {
    database.ref(`/${constants.API_VERSION}/users/${this.props.user.uid}/worksheets/`).once('value').then((myWorksheetsIds) => {
      if (myWorksheetsIds.exists() && myWorksheetsIds.val() !== []) {
        Promise.all(myWorksheetsIds.val().map(id => database.ref(`/${constants.API_VERSION}/worksheets/${id}/name/`).once('value'))).then((myWorksheetNames) => {
          this.setState({ worksheets: myWorksheetNames.map((myWorksheetName, index) => ({ id: myWorksheetsIds.val()[index], name: myWorksheetName.exists() && myWorksheetName.val() ? myWorksheetName.val() : 'Unknown' })) });
        });
      }
    });
  }
  createWorksheet() {
    if (this.state.newWorksheetName === '') {
      alert('ワークシート名が未入力です。');
      return;
    }
    // ワークシートのIDはシート名をtoLowerCaseしてencodeURIしたものにするシート名はシート名で別管理する
    const newWorksheetId = encodeURI(this.state.newWorksheetName.toLowerCase());
    // ワークシートのIDが存在しない場合は作成できる。
    database.ref(`/${constants.API_VERSION}/worksheets/${newWorksheetId}/`).once('value').then((snapshot) => {
      if (snapshot.exists()) {
        alert('そのワークシート名は作成できません。');
      } else {
        database.ref(`/${constants.API_VERSION}/users/${this.props.user.uid}/worksheets/`).set(this.state.worksheets.map(worksheet => worksheet.id).concat([newWorksheetId]));
        database.ref(`/${constants.API_VERSION}/worksheets/${newWorksheetId}/`).set({ users: [this.props.user.uid], name: this.state.newWorksheetName, openRange: constants.worksheetOpenRange.PUBLIC });
        this.setState({ worksheets: this.state.worksheets.concat([{ id: newWorksheetId, name: this.state.newWorksheetName }]), newWorksheetName: '', isOpenCreateWorksheetModal: false });
      }
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <Grid className={classes.root} container spacing={0} alignItems="stretch">
        <Grid item xs={12}>
          <div style={{ minHeight: '100vh' }}>
            <div className={classes.content}>
              <div style={{ marginBottom: 30 }}>
                <Typography style={{ color: '#fff' }} gutterBottom variant="title">{constants.TITLE}({constants.APP_VERSION})へようこそ！</Typography>
                <Typography style={{ color: '#fff' }} variant="body2">
                  Tips<span role="img" aria-label="Tips">💡</span>
                </Typography>
                <Typography style={{ color: '#fff' }} gutterBottom variant="body1">
                  もしまだコミュニティに参加されていなければ是非
                  　<a style={{ textDecoration: 'none' }} href={constants.COMMUNITY_URL} target="_blank">slackコミュニティ</a>　に参加してみてください！<br />
                  クローズドβ版ならではの限られた数人のコミュニティにユニークな開発者、ユーザーがいます😜<br />
                  {constants.TITLE}の話以外にもいろいろな雑談☕がゆる～く行われています。
                </Typography>
              </div>
              <Divider />
              <div style={{ marginTop: 30 }}>
                <Typography style={{ color: '#fff' }} gutterBottom variant="title">ワークシートの選択</Typography>
                <Typography style={{ color: '#fff' }} gutterBottom variant="caption">ワークシートを選択してください。</Typography>
              </div>
              <div style={{ marginTop: 30 }}>
                {this.state.worksheets.map(worksheet => (
                  <Link className={classes.link} key={worksheet.id} to={`/${worksheet.id}`} style={{ padding: this.props.theme.spacing.unit }}><Button size="small" variant="raised">{worksheet.name}</Button></Link>
                ))}
                <div style={{ display: 'inline-block', margin: this.props.theme.spacing.unit }}>
                  <Button size="small" variant="raised" onClick={() => { this.setState({ isOpenCreateWorksheetModal: true }); }}>+</Button>
                </div>
                <Dialog
                  open={this.state.isOpenCreateWorksheetModal}
                  onClose={() => { this.setState({ newWorksheetName: '', isOpenCreateWorksheetModal: false }); }}
                  aria-labelledby="form-dialog-title"
                >
                  <DialogTitle id="form-dialog-title">ワークシートを作成</DialogTitle>
                  <DialogContent>
                    <TextField
                      onChange={(e) => { this.setState({ newWorksheetName: e.target.value }); }}
                      value={this.state.newWorksheetName}
                      autoFocus
                      margin="dense"
                      id="name"
                      label="ワークシート名"
                      fullWidth
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button size="small" onClick={() => { this.setState({ isOpenCreateWorksheetModal: false }); }} color="primary">キャンセル</Button>
                    <Button size="small" onClick={this.createWorksheet.bind(this)} color="primary">作成</Button>
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

WorkSheetList.propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    photoURL: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
  }).isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(WorkSheetList);

