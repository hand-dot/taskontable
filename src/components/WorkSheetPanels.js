import React from 'react';
import PropTypes from 'prop-types';

import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import IconButton from '@material-ui/core/IconButton';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMore from '@material-ui/icons/ExpandMore';

import Dashboard from './Dashboard';
import TaskPool from './TaskPool';
import Members from './Members';
import DisclosureRange from './DisclosureRange';

import constants from '../constants';
import tasksUtil from '../tasksUtil';
import util from '../util';
import i18n from '../i18n';

function WorkSheetPanels(props) {
  const isMobile = util.isMobile();
  const {
    userId,
    userName,
    userPhotoURL,
    isOpenDashboard,
    isToday,
    tab,
    readOnly,
    worksheetDisclosureRange,
    worksheetId,
    taskTableFilterBy,
    tableTasks,
    poolTasks,
    members,
    worksheetName,
    invitedEmails,
    changePoolTasks,
    handleTab,
    handleMembers,
    handleInvitedEmails,
    handleWorksheetDisclosureRange,
    history,
  } = props;
  return (
    <ExpansionPanel
      expanded={isOpenDashboard}
      style={{
        margin: 0,
      }}
      elevation={1}
    >
      <ExpansionPanelSummary
        style={{
          marginBottom: 3,
        }}
        expandIcon={(
          <IconButton onClick={(e) => { handleTab(e, tab); }}>
            <ExpandMore />
          </IconButton>
        )}
      >
        <Tabs
          value={tab}
          onChange={handleTab}
          scrollable
          scrollButtons="off"
          indicatorColor="secondary"
        >
          <Tab
            label={(
              <span role="img" aria-label="dashboad">
                🚩
                {' '}
                {isMobile
                  ? ''
                  : i18n.t('worksheet.dashBoad')}
              </span>
            )}
          />
          <Tab
            disabled={readOnly}
            label={(
              <span role="img" aria-label="taskpool">
                📁
                {' '}
                {isMobile
                  ? ''
                  : i18n.t('worksheet.taskPool')}
              </span>
            )}
          />
          <Tab
            disabled={readOnly}
            label={(
              <span role="img" aria-label="members">
                👫
                {' '}
                {isMobile
                  ? ''
                  : i18n.t('worksheet.members')}
              </span>
            )}
          />
          <Tab
            disabled={readOnly}
            label={(
              <span role="img" aria-label="openrange">
                {worksheetDisclosureRange === constants.worksheetDisclosureRange.PUBLIC
                  ? '🔓'
                  : '🔒'}
                {isMobile
                  ? ''
                  : i18n.t('worksheet.disclosureRange')}
              </span>
            )}
          />
          {' '}
          {!isMobile && (
            <Tab
              disabled={readOnly}
              onClick={() => {
                history.push(`/${worksheetId}/scripts`);
              }}
              label={(
                <span role="img" aria-label="plugins">
                  🔌
                {' '}
                  {i18n.t('worksheet.plugIns')}
                  (
                <span role="img" aria-label="stop">
                    ⛔
                </span>
                  )
              </span>
              )}
            />
          )}
          {!isMobile && (
            <Tab
              disabled={readOnly}
              onClick={() => {
                history.push(`/${worksheetId}/activity`);
              }}
              label={(
                <span role="img" aria-label="activity">
                  📈
                {' '}
                  {i18n.t('worksheet.activity')}
                  (
                <span role="img" aria-label="stop">
                    ⛔
                </span>
                  )
              </span>
              )}
            />
          )}
        </Tabs>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails
        style={{
          display: 'block',
          padding: 0,
        }}
      >
        {tab === 0 && (
          <div>
            <Dashboard
              tableTasks={taskTableFilterBy
                ? tasksUtil.getTasksByAssign(tableTasks, taskTableFilterBy)
                : tableTasks}
              isToday={isToday}
            />
          </div>
        )}
        {tab === 1 && (
          <div>
            <TaskPool
              userId={userId}
              poolTasks={poolTasks}
              members={members}
              changePoolTasks={changePoolTasks}
            />
          </div>
        )}
        {tab === 2 && (
          <div style={{
            overflow: 'auto',
          }}
          >
            <Members
              userId={userId}
              userName={userName}
              userPhotoURL={userPhotoURL}
              worksheetId={worksheetId}
              worksheetName={worksheetName}
              members={members}
              invitedEmails={invitedEmails}
              handleMembers={handleMembers}
              handleInvitedEmails={handleInvitedEmails}
            />
          </div>
        )}
        {tab === 3 && (
          <div style={{
            overflow: 'auto',
          }}
          >
            <DisclosureRange
              worksheetDisclosureRange={worksheetDisclosureRange}
              handleWorksheetDisclosureRange={handleWorksheetDisclosureRange}
            />
          </div>
        )}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
}

WorkSheetPanels.propTypes = {
  userId: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  userPhotoURL: PropTypes.string.isRequired,
  isOpenDashboard: PropTypes.bool.isRequired,
  isToday: PropTypes.bool.isRequired,
  tab: PropTypes.number.isRequired,
  readOnly: PropTypes.bool.isRequired,
  worksheetDisclosureRange: PropTypes.string.isRequired,
  worksheetId: PropTypes.string.isRequired,
  taskTableFilterBy: PropTypes.string.isRequired,
  tableTasks: PropTypes
    .arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      assign: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      estimate: PropTypes.any.isRequired,
      endTime: PropTypes.string.isRequired,
      startTime: PropTypes.string.isRequired,
      memo: PropTypes.string.isRequired,
    }))
    .isRequired,
  poolTasks: PropTypes
    .shape({ highPriorityTasks: PropTypes.array.isRequired, lowPriorityTasks: PropTypes.array.isRequired, regularTasks: PropTypes.array.isRequired })
    .isRequired,
  members: PropTypes
    .arrayOf(PropTypes.shape({
      displayName: PropTypes.string.isRequired, photoURL: PropTypes.string.isRequired, uid: PropTypes.string.isRequired, email: PropTypes.string.isRequired, fcmToken: PropTypes.string.isRequired,
    }))
    .isRequired,
  worksheetName: PropTypes.string.isRequired,
  invitedEmails: PropTypes
    .arrayOf(PropTypes.string.isRequired)
    .isRequired,
  changePoolTasks: PropTypes.func.isRequired,
  handleTab: PropTypes.func.isRequired,
  handleMembers: PropTypes.func.isRequired,
  handleInvitedEmails: PropTypes.func.isRequired,
  handleWorksheetDisclosureRange: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired, // eslint-disable-line
};

export default WorkSheetPanels;
