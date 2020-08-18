import React, { useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import * as actions from '../../../actions';
import { RootState } from '../../../reducers';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { TextField, Paper, Divider, IconButton, Select } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      width: 280,
    },
    column: {
      width: 'calc(100vw / 3 - 50px)',
      marginLeft: 5,
      marginRight: 5,
    },
    rankItem: {
      padding: 5,
      display: 'flex',
    },
    rankName: {
      width: 200,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    },
    divider: {
      marginTop: 10,
      marginBottom: 10,
    },
  }),
);

type ComponentProps = ReturnType<typeof mapStateToProps>;
type ActionProps = typeof mapDispatchToProps;

type PropsType = ComponentProps & ActionProps;
const Component: React.SFC<PropsType> = (props: PropsType) => {
  const classes = useStyles({});

  const channelListRef = React.useRef<HTMLSelectElement>();
  const [channelList, setChannelList] = React.useState<typeof props.list.rank>([]);

  const ptRef = React.useRef<HTMLInputElement>();

  useEffect(() => {
    const channelList = JSON.parse(JSON.stringify(props.list.rank)).sort((a: any, b: any) => {
      if (a.channelId > b.channelId) return 1;
      if (a.channelId < b.channelId) return -1;
      return 0;
    });
    setChannelList(channelList);
  }, [JSON.stringify(props.list.rank.length)]);

  const addChannel = useCallback(() => {
    const channelId = channelListRef?.current?.value;
    if (channelId) {
      props.addChannel(Number(channelId));
    }
  }, []);

  const updateFilterPt = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const pt = event.target.value;
    props.updateFilter(Number(pt));
  }, []);

  return (
    <div className={classes.root}>
      {/* 操作パネル */}
      <div>
        <Typography variant={'h6'}>pt表示下限</Typography>
        <TextField defaultValue={1} onChange={updateFilterPt} /> pt
      </div>

      <Divider className={classes.divider} />

      <div>
        <Typography variant={'h6'}>監視対象追加</Typography>
        <Select style={{ width: 200 }} inputRef={channelListRef}>
          {channelList.map((channel) => {
            return (
              <option key={channel.channelId} value={channel.channelId}>
                {channel.channelName}
              </option>
            );
          })}
        </Select>
        <Fab size={'small'} color={'primary'} onClick={addChannel}>
          <AddIcon />
        </Fab>
      </div>

      <Divider className={classes.divider} />

      {/* リスト */}
      <Typography variant={'h6'}>ランキング</Typography>
      <Paper>
        {props.list.rank.map((rank) => {
          return (
            <Paper key={rank.channelId} className={classes.rankItem}>
              <div className={classes.rankName}>{rank.channelName}</div>
              <div style={{ marginLeft: 'auto' }}>{rank.point}</div>
            </Paper>
          );
        })}
      </Paper>
    </div>
  );
};

// state
const mapStateToProps = (state: RootState) => {
  return {
    list: state.reducer.event,
  };
};

// action
const mapDispatchToProps = {
  addChannel: actions.addChannelById,
  updateFilter: actions.updateFilterPt,
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);
