import Polyglot from 'node-polyglot';
import constants from '../constants';
import en from './en';
import ja from './ja';

const polyglot = new Polyglot();
polyglot.extend({
  en,
  ja,
});
polyglot.locale((window.navigator.languages && window.navigator.languages[0]) ||
window.navigator.language ||
window.navigator.userLanguage ||
window.navigator.browserLanguage);
const language = (() => (constants.SUPPORTLANGAGES.indexOf(polyglot.locale()) >= 0 ? polyglot.locale() : 'en'))();
export default {
  t(key, arg) {
    return arg ? polyglot.t(`${language}.${key}`, arg) : polyglot.t(`${language}.${key}`);
  },
};

