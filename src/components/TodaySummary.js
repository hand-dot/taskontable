import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "material-ui/styles";
import Table, { TableBody, TableCell, TableRow } from "material-ui/Table";

const styles = theme => ({});

let id = 0;
function createData({ title, hour, task }) {
  id += 1;
  return { id, title, hour, task };
}

function BasicTable(props) {
  const { datas } = props;

  return (
    <Table>
      <TableBody>
        {datas.map(data => {
          let n = createData(data);
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
  );
}

BasicTable.propTypes = {
  datas: PropTypes.array.isRequired
};

export default withStyles(styles)(BasicTable);
