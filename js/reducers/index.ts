import { combineReducers } from 'redux';
import { ActionType, getType } from 'typesafe-actions';
import * as actions from '../actions';
import { EventRanking } from '../sagas/lineUtil';
type Action = ActionType<typeof actions>;

export type DialogState = {
  /** ダイアログ表示 */
  show: boolean;
  /** 確認ダイアログか否か */
  confirm: boolean;
  /** ダイアログ種別 */
  type: 'info' | 'warning' | 'error';
  /** 簡潔に表すメッセージ */
  message: string;
  /** テキストボックスとかで表示したい詳細 */
  detail: string;
};

export type GlobalState = {
  status: 'initialzing' | 'uploading' | 'posting' | 'ok' | 'error';
  /** 通知欄 */
  notify: {
    /** 表示可否 */
    show: boolean;
    /** 色 */
    type: 'info' | 'warning' | 'error';
    /** メッセージ */
    message: string;
    /** 手動で閉じられるか */
    closable: boolean;
  };
  /** ダイアログ */
  dialog: DialogState;
  /** イベント情報 */
  event: {
    id: number;
    rank: EventRanking['rows'];
  };
  filter: {
    quantity: number;
  };
  channels: {
    [channelId: string]: {
      channelId: number;
      channelName: string;
      channelIconURL: string;
      status: string;
      broadcastId: number;
      gifts: {
        message: '';
        type: 'LOVE';
        itemId: string;
        quantity: number;
        displayName: string;
        sender: {
          id: number;
          hashedId: string;
          displayName: string;
          iconUrl: string;
          hashedIconId: string;
          isGuest: boolean;
          isBlocked: boolean;
          isPremiumMember: boolean;
        };
        isNGGift: boolean;
        sentAt: number;
        key: string;
      }[];
    };
  };
};

export type RootState = {
  reducer: GlobalState;
};

const initial: GlobalState = {
  status: 'ok',
  // 通知欄
  notify: {
    show: false,
    type: 'info',
    message: '',
    closable: true,
  },
  dialog: {
    show: false,
    confirm: false,
    type: 'info',
    message: '',
    detail: '',
  },
  event: {
    id: 0,
    rank: [],
  },
  filter: {
    quantity: 1,
  },
  channels: {},
};

const reducer = (state: GlobalState = initial, action: Action): GlobalState => {
  switch (action.type) {
    case getType(actions.updateStatus): {
      return { ...state, status: action.payload };
    }
    case getType(actions.changeNotify): {
      return { ...state, notify: { ...action.payload } };
    }
    case getType(actions.closeNotify): {
      return { ...state, notify: { ...state.notify, show: false } };
    }
    case getType(actions.changeDialog): {
      if (action.payload.show === false) {
        return { ...state, dialog: initial.dialog };
      } else {
        return { ...state, dialog: { ...state.dialog, ...action.payload } };
      }
    }
    case getType(actions.closeDialog): {
      return { ...state, dialog: { ...initial.dialog } };
    }

    case getType(actions.updateRanking): {
      return {
        ...state,
        event: action.payload,
      };
    }

    case getType(actions.addChannel): {
      return {
        ...state,
        channels: {
          ...state.channels,
          [action.payload.id]: {
            channelId: action.payload.id,
            channelIconURL: action.payload.iconURL,
            channelName: action.payload.title,
            broadcastId: 0,
            status: 'waiting...',
            gifts: [],
          },
        },
      };
    }

    case getType(actions.updateChannelStatus): {
      const newChannel: typeof state.channels = JSON.parse(JSON.stringify(state.channels));
      newChannel[action.payload.channelId].status = action.payload.status;
      if (action.payload.broadcastId) newChannel[action.payload.channelId].broadcastId = action.payload.broadcastId;
      return {
        ...state,
        channels: newChannel,
      };
    }

    case getType(actions.updateBroadcastComment): {
      // console.log(state);
      // console.log(action);
      const newChannel = JSON.parse(JSON.stringify(state.channels));
      newChannel[action.payload.channelId].gifts.push(action.payload.comment as any);
      newChannel[action.payload.channelId].broadcastId = action.payload.broadcastId;

      return {
        ...state,
        channels: newChannel,
      };
    }

    case getType(actions.updateFilterPt): {
      const num = Number.isNaN(action.payload) ? 0 : action.payload;

      return {
        ...state,
        filter: {
          ...state.filter,
          quantity: num,
        },
      };
    }

    default:
      return state;
  }
};

export default combineReducers({ reducer });
