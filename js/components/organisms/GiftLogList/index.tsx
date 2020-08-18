import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { RootState } from '../../../reducers';
import { Avatar, Paper, Divider } from '@material-ui/core';
import useInterval from 'use-interval';
import moment from 'moment';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      height: '100%',
    },
    column: {
      width: '300px',
      height: 'calc(100vh - 25px)',
      marginLeft: 5,
      marginRight: 5,
      padding: 5,
    },
    columnHeader: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    giftLog: {
      // display: 'flex',
      overflowY: 'scroll',
      height: 'calc(100% - 70px)',
    },
    giftItem: {
      margin: 5,
      padding: 5,
    },
    giftMain: {
      display: 'flex',
    },
    giftSub: {
      display: 'flex',
      fontSize: 'small',
      color: 'lightgray',
    },
  }),
);

type ComponentProps = ReturnType<typeof mapStateToProps>;
type ActionProps = typeof mapDispatchToProps;

type PropsType = ComponentProps & ActionProps;
const Component: React.SFC<PropsType> = (props: PropsType) => {
  // console.log('[GiftLogList]');
  const classes = useStyles({});

  const channelIdList = Object.keys(props.list);

  const [channelList, setChannelList] = React.useState<ComponentProps['list']['0'][]>(channelIdList.map((id) => props.list[id]));
  React.useEffect(() => {
    const channelIdList = Object.keys(props.list);
    setChannelList(channelIdList.map((id) => props.list[id]));
  }, [props.list]);

  return (
    <div className={classes.root}>
      {channelList.map((channel) => {
        let rank = 'x';
        let pt = '';
        const temp = props.event.rank.filter((rank) => rank.channelId === channel.channelId);
        if (temp.length > 0) {
          rank = `${temp[0].rank}`;
          pt = `${temp[0].point}`;
        }

        return <GiftLog key={channel.channelId} channel={channel} pt={pt} rank={rank} filter={props.filter} />;
      })}
    </div>
  );
};

type GiftProps = {
  channel: ComponentProps['list']['0'];
  filter: ComponentProps['filter'];
  rank: string;
  pt: string;
};
const GiftLog: React.SFC<GiftProps> = (props: GiftProps) => {
  // console.log('[GiftLogList]');
  const classes = useStyles({});

  const ref = React.useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
  const targetRef = React.useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;

  const [autoscroll, setAutoscroll] = React.useState(true);
  const [position, setPosition] = React.useState(0);

  const stopAutoScroll = React.useCallback(() => {
    setAutoscroll(false);
  }, []);

  const scrollToBottomOfList = React.useCallback(() => {
    // console.log(`[scrollToBottomOfList] ${props.channel.channelName}`);
    // console.log(targetRef?.current);

    targetRef?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [targetRef]);

  // 一定時間スクロール触ってなかったら末尾へ
  useInterval(() => {
    const now = ref?.current?.scrollTop ?? 0;
    // console.log(`[useInterval] channelName=${props.channel.channelName} now=${now} position=${position} autoscroll=${autoscroll}`);
    if (position === now) {
      setAutoscroll(true);
      // console.log('[useInterval] scrollするよ');
      scrollToBottomOfList();
    }
    setPosition(now);
  }, 5000);

  useEffect(() => {
    if (autoscroll) {
      // console.log(`[useEffect] ${props.channel.channelName} scroll`);
      scrollToBottomOfList();
    }
  }, [props.channel.gifts.length]);

  return (
    <Paper key={props.channel.channelId} className={classes.column}>
      <div className={classes.columnHeader}>
        <Avatar src={props.channel.channelIconURL} />
        <div>
          <a href={`https://live.line.me/channels/${props.channel.channelId}/broadcast/${props.channel.broadcastId}`}>{props.channel.channelName}</a>
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'lightgrey' }}>status: {props.channel.status}</div>
      <div style={{ display: 'flex' }}>
        <div>{props.rank} 位</div>
        <div style={{ marginLeft: 'auto' }}>{props.pt} pt</div>
      </div>
      <Divider />

      <div className={classes.giftLog} ref={ref} onClick={stopAutoScroll} onWheel={stopAutoScroll}>
        {props.channel.gifts
          .filter((gift) => gift.quantity >= props.filter.quantity)
          .map((gift, index) => {
            let color: string;
            if (gift.quantity >= 10000) {
              color = 'red';
            } else if (gift.quantity >= 1000) {
              color = 'yellow';
            } else {
              color = 'white';
            }

            return (
              <Paper key={`${gift.key}_${index}`} className={classes.giftItem} style={{ backgroundColor: color }}>
                <div className={classes.giftMain}>
                  <div>{gift.sender.displayName}</div>
                  <div style={{ marginLeft: 'auto' }}>{gift.quantity}</div>
                </div>
                <div className={classes.giftSub}>
                  <div>{moment(gift.sentAt * 1000).format('YYYY/MM/DD hh:mm:ss')}</div>
                </div>
              </Paper>
            );
          })}
        <div ref={targetRef}> </div>
      </div>
    </Paper>
  );
};

// state
const mapStateToProps = (state: RootState) => {
  return {
    list: state.reducer.channels,
    event: state.reducer.event,
    filter: state.reducer.filter,
  };
};

// action
const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Component);
