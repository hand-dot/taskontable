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
  cloneDeep(object) {
    let node;
    if (object === null) {
      node = object;
    } else if (Array.isArray(object)) {
      node = object.slice(0) || [];
      node.forEach((n) => {
        if ((typeof n === 'object' && n !== {}) || Array.isArray(n)) {
          n = this.cloneDeep(n); // eslint-disable-line no-param-reassign
        }
      });
    } else if (typeof object === 'object') {
      node = Object.assign({}, object);
      Object.keys(node).forEach((key) => {
        if (typeof node[key] === 'object' && node[key] !== {}) {
          node[key] = this.cloneDeep(node[key]);
        }
      });
    } else {
      node = object;
    }
    return node;
  },
};
