import tableTaskSchema from './tableTaskSchema';
// taskSchemaに定期タスクとしての値を追加
export default Object.assign({ dayOfWeek: [], week: [] }, tableTaskSchema);

