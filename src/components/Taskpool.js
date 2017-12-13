import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from 'material-ui/ExpansionPanel';
import Badge from 'material-ui/Badge';
import Input from 'material-ui/Input';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

const styles = {
};

function Taskpool(props) {
  const {} = props;
  const data = [
    { title: '燃えるゴミ出し', memo: '３つくらい玄関にある', estimate: 5 },
    { title: '朝食', memo: 'ヨーグルトを食べてはいけない', estimate: 20 },
    { title: '出勤', memo: '', estimate: 60 },
    { title: 'メールチェック', memo: '', estimate: 10 },
    { title: '日報', memo: '', estimate: 10 },
  ];
  return (
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<i className="fa fa-angle-down fa-lg" />}>
        <Badge badgeContent={5} color="primary">
          <i className="fa fa-tasks fa-lg" />
        </Badge>
        <Typography>　タスクプール</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Grid item xs={12}>
          <Typography gutterBottom type="title">
            TODO
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>作業内容</TableCell>
                <TableCell>備考</TableCell>
                <TableCell numeric>見積</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((n, index) => (
                <TableRow key={index.toString()}>
                  <TableCell>{n.title}</TableCell>
                  <TableCell>{n.memo}</TableCell>
                  <TableCell numeric>{n.estimate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Input
                    fullWidth
                    placeholder="作業内容"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    fullWidth
                    placeholder="備考"
                  />
                </TableCell>
                <TableCell numeric>
                  <Input
                    placeholder="見積"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Button raised color="default" style={{ float: 'right', marginRight: 24 }}>
            <i className="fa fa-plus fa-lg" />
           　追加
          </Button>
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
}

Taskpool.propTypes = {
};

export default withStyles(styles)(Taskpool);
