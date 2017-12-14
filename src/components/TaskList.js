import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import IconButton from 'material-ui/IconButton';
import Input from 'material-ui/Input';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

const styles = {
  root: {
    padding: '0 20px',
  },
  actionIcon: {
    width: 30,
  },
  miniCell: {
    maxWidth: 50,
  },
};

function TaskList(props) {
  const { datas, classes } = props;
  return (
    <div className={classes.root}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="none">作業内容</TableCell>
            <TableCell padding="none">備考</TableCell>
            <TableCell className={classes.miniCell} padding="none">見積</TableCell>
            <TableCell padding="none">アクション</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {datas.map((n, index) => (
            <TableRow hover key={index.toString()}>
              <TableCell padding="none">{n.title}</TableCell>
              <TableCell padding="none">{n.memo}</TableCell>
              <TableCell className={classes.miniCell} padding="none">{n.estimate}</TableCell>
              <TableCell padding="none">
                <IconButton className={classes.actionIcon} color="default">
                  <i className="fa fa-level-down" />
                </IconButton>
                /
                <IconButton className={classes.actionIcon} color="default">
                  <i className="fa fa-trash-o" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell padding="none">
              <Input
                fullWidth
                placeholder="作業内容"
              />
            </TableCell>
            <TableCell padding="none">
              <Input
                fullWidth
                placeholder="備考"
              />
            </TableCell>
            <TableCell className={classes.miniCell} padding="none">
              <Input
                placeholder="見積"
              />
            </TableCell>
            <TableCell padding="none">
              <IconButton color="default">
                <i className="fa fa-plus" />
              </IconButton>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

TaskList.propTypes = {
  datas: PropTypes.array.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TaskList);
