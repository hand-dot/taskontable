import tableTaskSchema from './tableTaskSchema';
// taskSchemaに処理中タスクとしての値を追加
export default Object.assign({ now: '' }, tableTaskSchema);

