import constants from '../constants';

/**
* ブラウザの言語設定を取得します。
* サポート言語以外のものは en にフォールバックします。
*/
const getBrowserLanguage = () => {
    const language = (window.navigator.languages && window.navigator.languages[0]) ||
        window.navigator.language ||
        window.navigator.userLanguage ||
        window.navigator.browserLanguage;
    return constants.SUPPORTLANGAGES.indexOf(language) >= 0 ? language : 'en';
}

export const i18n = require(`./${getBrowserLanguage()}`).default;