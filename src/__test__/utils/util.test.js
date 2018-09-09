import { assert } from 'chai';
import moment from 'moment';
import util from '../../utils/util';
import constants from '../../constants';

it('isToday - 今日の文字列をconstants.DATEFMT形式で指定してtrueになること', () => {
  assert.isTrue(util.isToday(moment().format(constants.DATEFMT)));
});
it('isToday - 明日の文字列をconstants.DATEFMT形式で指定してfalseになること', () => {
  assert.isFalse(util.isToday(moment().add(1, 'days').format(constants.DATEFMT)));
});
it('isToday - 昨日の文字列をconstants.DATEFMT形式で指定してfalseになること', () => {
  assert.isFalse(util.isToday(moment().add(-1, 'days').format(constants.DATEFMT)));
});
it('getTimeDiffMinute - HH:mm形式の文字列の2つの差分を分で求められること', () => {
  assert.equal(util.getTimeDiffMinute('00:00', '00:01'), 1);
});
it('getTimeDiffMinute - HH:mm形式の文字列の2つの差分を分で求められること(一時間以上)', () => {
  assert.equal(util.getTimeDiffMinute('10:00', '11:01'), 61);
});
it('getTimeDiffMinute - HH:mm形式の文字列の2つの差分を分で求められること(負の値)', () => {
  assert.equal(util.getTimeDiffMinute('11:01', '10:00'), -61);
});
it('getTimeDiffSec - HH:mm:ss形式の文字列の2つの差分を秒で求められること', () => {
  assert.equal(util.getTimeDiffSec('10:00:31', '10:01:01'), 30);
});
it('getTimeDiffSec - HH:mm:ss形式の文字列の2つの差分を秒で求められること(負の値)', () => {
  assert.equal(util.getTimeDiffSec('10:01:01', '10:00:31'), -30);
});
it('getDayAndCount - Dateオブジェクトから何週目の何曜日という情報を持ったオブジェクトを返せること1', () => {
  assert.deepEqual(util.getDayAndCount(new Date(2018, 5, 1)), { day: 5, count: 1 });
});
it('getDayAndCount - Dateオブジェクトから何週目の何曜日という情報を持ったオブジェクトを返せること2', () => {
  assert.deepEqual(util.getDayAndCount(new Date(2018, 5, 12)), { day: 2, count: 2 });
});
it('getDayAndCount - Dateオブジェクトから何週目の何曜日という情報を持ったオブジェクトを返せること3', () => {
  assert.deepEqual(util.getDayAndCount(new Date(2018, 5, 10)), { day: 0, count: 2 });
});
it('getDayAndCount - Dateオブジェクトから何週目の何曜日という情報を持ったオブジェクトを返せること4', () => {
  assert.deepEqual(util.getDayAndCount(new Date(2018, 5, 23)), { day: 6, count: 4 });
});
it('getDayAndCount - Dateオブジェクトから何週目の何曜日という情報を持ったオブジェクトを返せること5', () => {
  assert.deepEqual(util.getDayAndCount(new Date(2018, 5, 29)), { day: 5, count: 5 });
});
it('setIdIfNotExist - 引き数のオブジェクトにIDが存在しない場合、設定すること', () => {
  const obj = {};
  util.setIdIfNotExist(obj);
  assert.exists(obj.id);
});
it('setIdIfNotExist - 引き数のオブジェクトにIDが存在しない場合、設定しないこと', () => {
  const obj = { id: 'myid' };
  util.setIdIfNotExist(obj);
  assert.equal(obj.id, 'myid');
});
it('validateEmail - emailとして正しい場合', () => {
  assert.isTrue(util.validateEmail('info@example.com'));
});
it('validateEmail - emailとして正しくない場合', () => {
  assert.isFalse(util.validateEmail('this is not email'));
});
it('validateDatabaseKey - リアルタイムデータベースのキーとして正しい場合', () => {
  assert.isTrue(util.validateDatabaseKey('valid'));
});
it('validateDatabaseKey - リアルタイムデータベースのキーとして正しくない場合', () => {
  assert.isFalse(util.validateDatabaseKey('invalid[1]'));
});
it('isNaturalNumber - 自然数の場合', () => {
  assert.isTrue(util.isNaturalNumber(1));
});
it('isNaturalNumber - 0の場合', () => {
  assert.isFalse(util.isNaturalNumber(0));
});
it('isNaturalNumber - 負の数の場合', () => {
  assert.isFalse(util.isNaturalNumber(-1));
});
it('isNaturalNumber - nullの場合', () => {
  assert.isFalse(util.isNaturalNumber(null));
});
it('isNaturalNumber - NaNの場合', () => {
  assert.isFalse(util.isNaturalNumber(NaN));
});
