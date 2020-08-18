import { EventEmitter } from 'events';
// import axios from 'axios';
import { sleep, fetchJsonp } from './common';

export type Channel = {
  /** ステータスコード。正常時200が返ってくるっぽい。 */
  apistatusCode: number;
  /** アイコン画像 */
  iconURL: string;
  /** ユーザID */
  id: number;
  /** タイトル */
  title: string;
  /** 配信してたらtrue */
  isBroadcastingNow: boolean;
  liveBroadcasts: {
    hasNextPage: boolean;
    /** 配信してたら要素がある。してなかったら空配列。  */
    rows: {
      /** ステータスコード。正常時200が返ってくるっぽい。 */
      apistatusCode: number;
      /** ユーザID */
      channelId: number;
      /** 動画ID */
      id: number;
      /** 配信中なら"LIVE" */
      liveStatus: string;
      // 省略
    }[];
    /** ステータスコード。正常時200が返ってくるっぽい。 */
    apistatusCode: number;
  };
  /** ステータスコード。正常時200が返ってくるっぽい。 */
  status: number;
  // 省略
};

type Broadcast = {
  chat: {
    /** チャットのWebSocketURL */
    url: string;
    /** 配信中ならnull。たぶんstringになる。 */
    archiveURL: any;
    /** 配信者コメントのWebSocketURL */
    ownerMessageURL: string;
  };
  status: number;
  // 省略
};

type Chat = SystemMessage | Bulk | MessageTemplate | GuideMessage | Message | GiftMessage;

type SystemMessage = {
  type: 'systemMessage';
  data: {
    code: string;
    eventType: string;
    extraData: {
      user?: string;
    };
  };
};

type Bulk = {
  type: 'bulk';
  data: {
    payloads: object;
  };
};

type MessageTemplate = {
  type: 'messageTemplate';
  data: any;
};

type GuideMessage = {
  type: 'guideMessage';
  data: any;
};

export type GiftMessage = {
  type: 'giftMessage';
  data: Message['data'];
};

type Message = {
  type: 'message';
  data: {
    message: string;
    type: string;
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
  };
};

export type EventRanking = {
  apistatusCode: number;
  border: null;
  hasNextPage: boolean;
  rows: {
    active: boolean;
    channelIconURL: string;
    channelId: number;
    channelName: string;
    followerCount: number;
    nowBroadcasting: boolean;
    point: number;
    rank: number;
    rowNum: number;
  }[];
  status: number;
};

export const fetchChannel = async (channelId: number) => {
  const url = `https://live-api.line-apps.com/web/v4.0/channel/${channelId}`;
  // const result: Channel = (await axios.get(url)).data;
  const result = JSON.parse((await fetchJsonp(url)).data.htmlStr) as Channel;

  return result;
};

export const fetchEventRanking = async (eventId: number) => {
  const url = `https://live-api.line-apps.com/web/v3.7/events/${eventId}/ranking`;
  // const result: EventRanking = (await axios.get(url)).data;
  const result = JSON.parse((await fetchJsonp(url)).data.htmlStr) as EventRanking;
  return result.rows;
};

export class LineLiveComment extends EventEmitter {
  constructor(channelId: number) {
    super();
    this.channelId = channelId;
  }
  readonly channelId: number;
  broadcastId: number;
  socket: WebSocket;

  public start = async () => {
    this.broadcastPolling();
  };

  private broadcastPolling = async () => {
    this.emit('wait');

    // 動画ID取得
    const url = `https://live-api.line-apps.com/web/v4.0/channel/${this.channelId}`;
    const result = JSON.parse((await fetchJsonp(url)).data.htmlStr) as Channel; //(await axios.get(url)).data;
    if (result.isBroadcastingNow) {
      this.broadcastId = result.liveBroadcasts.rows[0].id;
      this.emit('open', {
        channelId: this.channelId,
        broadcastId: this.broadcastId,
      });
      this.chatStart();
    } else {
      await sleep(60 * 1000);
      this.broadcastPolling();
    }
  };

  private chatStart = async () => {
    const url = `https://live-api.line-apps.com/web/v4.0/channel/${this.channelId}/broadcast/${this.broadcastId}`;
    const result = JSON.parse((await fetchJsonp(url)).data.htmlStr) as Broadcast; //(await axios.get(url)).data;
    this.socket = new WebSocket(result.chat.url);
    this.socket.onerror = (event) => {
      console.error('WebSocketでエラー');
      console.error(event);
      if (this.socket.OPEN) {
        this.socket.close();
      }
    };
    this.socket.onclose = (event) => {
      this.broadcastPolling();
    };
    this.socket.onmessage = (event) => {
      this.emit('comment', {
        channelId: this.channelId,
        broadcastId: this.broadcastId,
        comment: JSON.parse(event.data),
      });
    };
  };

  // 開発用
  test = async () => {
    const array = [1, 10, 100, 1000, 10000, 100000];
    const broadcastId = Math.floor(Math.random() * 100000);
    const testGift = {
      type: 'giftMessage',
      data: {
        message: '',
        type: 'LOVE',
        itemId: 'gire005',
        quantity: array[Math.floor(Math.random() * array.length)],
        displayName: 'live.gift.regular.10.luckycat.pink',
        sender: {
          id: 8000000,
          hashedId: 'ZbfIS1BPJO',
          displayName: 'Test User',
          iconUrl: 'https://obs.line-scdn.net/0h8CpSJjtJZ2xNKk4xAUAYO3V3YRs0BGQkNQ58SXQpMAhhHyYzI0t8D2EoPw9nSSA6JR9_DzgrblViGHVqcg/f64x64',
          hashedIconId: '0h8CpSJjtJZ2xNKk4xAUAYO3V3YRs0BGQkNQ58SXQpMAhhHyYzI0t8D2EoPw9nSSA6JR9_DzgrblViGHVqcg',
          isGuest: false,
          isBlocked: false,
          isPremiumMember: false,
          listenerRank: 0,
        },
        isNGGift: false,
        sentAt: Math.floor(new Date().getTime() / 1000),
        key: `${Math.floor(new Date().getTime() / 1000)}`,
      },
    };

    const chat = { channelId: this.channelId, broadcastId: broadcastId, comment: testGift };

    this.emit('comment', chat);

    await sleep(Math.random() * 5000);
    this.test();
  };

  /** コメント取得の停止 */
  public stop = () => {
    if (this.socket) this.socket.close();
    this.broadcastId = 0;
    this.emit('end');
  };

  // チャンネル情報を取得できた時
  public on(event: 'start', listener: () => void): this;
  // 配信が開始していない時
  public on(event: 'wait', listener: () => void): this;
  // 配信情報を取得できた時
  public on(event: 'open', listener: (chat: { channelId: number; broadcastId: number }) => void): this;
  // イベント
  public on(event: 'comment', listener: (chat: { channelId: number; broadcastId: number; comment: Chat }) => void): this;
  // 停止した時
  public on(event: 'end', listener: (reason?: string) => void): this;
  // 何かエラーあった時
  public on(event: 'error', listener: (err: Error) => void): this;
  public on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}
