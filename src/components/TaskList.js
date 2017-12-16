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
            <TableCell>作業内容</TableCell>
            <TableCell>備考</TableCell>
            <TableCell className={classes.miniCell}>見積</TableCell>
            <TableCell>アクション</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {datas.map((n, index) => (
            <TableRow hover key={index.toString()}>
              <TableCell>{n.title}</TableCell>
              <TableCell>{n.memo}</TableCell>
              <TableCell className={classes.miniCell}>{n.estimate}</TableCell>
              <TableCell>
                <IconButton className={classes.actionIcon} color="default">
                  <i className="fa fa-level-down" />
                </IconButton>
                <span>　/　</span>
                <IconButton className={classes.actionIcon} color="default">
                  <i className="fa fa-trash-o" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
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
            <TableCell className={classes.miniCell}>
              <Input
                placeholder="見積"
              />
            </TableCell>
            <TableCell>
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
