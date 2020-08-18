import { deprecated } from 'typesafe-actions';
import { DialogState, RootState } from '../reducers';
import { GiftMessage, Channel, EventRanking } from '../sagas/lineUtil';

const createAction = deprecated.createAction;

const OPEN_NOTIFY = 'OPEN_NOTIFY';
const CLOSE_NOTIFY = 'CLOSE_NOTIFY';
const OPEN_DIALOG = 'OPEN_DIALOG';
const CLOSE_DIALOG = 'CLOSE_DIALOG';

const DIALOG_YES = 'DIALOG_YES';
const DIALOG_NO = 'DIALOG_NO';

const UPDATE_STATUS = 'UPDATE_STATUS';
export const updateStatus = createAction(UPDATE_STATUS, (action) => {
  return (status: RootState['reducer']['status']) => action(status);
});

/** 通知欄表示 */
export const changeNotify = createAction(OPEN_NOTIFY, (action) => {
  return (show: boolean, type: 'info' | 'warning' | 'error', message: string, closable?: boolean) => action({ show, type, message, closable: closable === false ? false : true });
});
/** 通知欄閉じる */
export const closeNotify = createAction(CLOSE_NOTIFY);

/** ダイアログ表示 */
export const changeDialog = createAction(OPEN_DIALOG, (action) => {
  return (args: Partial<DialogState>) => action(args);
});
/** ダイアログ閉じる */
export const closeDialog = createAction(CLOSE_DIALOG);

export const dialogYes = createAction(DIALOG_YES, (action) => {
  return (args: any) => action(args);
});
export const dialogNo = createAction(DIALOG_NO, (action) => {
  return (args: any) => action(args);
});

export const updateRanking = createAction('UPDATE_RANKING', (action) => {
  return (obj: { id: number; rank: EventRanking['rows'] }) => action(obj);
});

export const addChannelById = createAction('ADD_CHANNEL_BY_ID', (action) => {
  return (channelId: number) => action(channelId);
});
export const addChannel = createAction('ADD_CHANNEL', (action) => {
  return (obj: Channel) => action(obj);
});
export const updateBroadcastComment = createAction('UPDATE_BROADCAST_COMMENT', (action) => {
  return (obj: { channelId: number; broadcastId: number; comment: GiftMessage['data'] }) => action(obj);
});
export const updateFilterPt = createAction('UPDATE_FILTER_PT', (action) => {
  return (obj: number) => action(obj);
});
export const updateChannelStatus = createAction('UPDATE_CHANNEL_STATUS', (action) => {
  return (status: { channelId: number; broadcastId?: number; status: string }) => action(status);
});
