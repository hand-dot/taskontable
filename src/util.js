import moment from 'moment';

export default {
  getCrrentTimeObj() {
    const currentMoment = moment();
    return {
      hour: currentMoment.hour(),
      minute: currentMoment.minute(),
      second: currentMoment.second(),
    };
  },
  isSameObj(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  },
};
