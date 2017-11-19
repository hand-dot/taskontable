import React from "react";
import PropTypes from "prop-types";
import Typography from "material-ui/Typography";
import { withStyles } from "material-ui/styles";
import Table, {
  TableBody,
  TableCell,
  TableRow
} from "material-ui/Table";

const styles = theme => ({
});

let id = 0;
function createData(title, hour, task) {
  id += 1;
  return { id, title, hour, task };
}

const data = [
  createData("見積もり", 159, 6.0),
  createData("消化", 237, 9.0),
  createData("残", 262, 16.0)
];

function BasicTable(props) {
  const { classes } = props;

  return (
    <div>
      <Typography type="title">今日のサマリー</Typography>
      <Table>
        <TableBody>
          {data.map(n => {
            return (
              <TableRow key={n.id}>
                <TableCell padding="none">{n.title}</TableCell>
                <TableCell padding="none">{n.hour}h</TableCell>
                <TableCell padding="none">{n.task}タスク</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

BasicTable.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(BasicTable);
