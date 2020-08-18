import React from 'react';
import { connect } from 'react-redux';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import * as actions from '../../../actions';
import Snackbar from '../../molecules/SnackBar';
import Modal from '../../molecules/Modal';
import { RootState } from '../../../reducers';
import Dialog from '../../organisms/Dialog';
import ChatIcon from '@material-ui/icons/Chat';
import ListIcon from '@material-ui/icons/List';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import GiftLogList from '../../organisms/GiftLogList';
import EventRanking from '../../organisms/EventRanking';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      justifyContent: 'center',
      display: 'flex',
      height: '100%',
    },
    content: {
      width: '100%',
      display: 'flex',
      height: '100%',
    },
    login: {
      padding: 10,
    },
    button: {
      margin: theme.spacing(1),
      float: 'right',
      top: '-60px',
    },
    icon: {},
  }),
);

type ComponentProps = ReturnType<typeof mapStateToProps>;
type ActionProps = typeof mapDispatchToProps;

type PropsType = ComponentProps & ActionProps;
const App: React.SFC<PropsType> = (props: PropsType) => {
  const classes = useStyles({});

  const tabs = [
    {
      label: '投稿',
      icon: <ChatIcon />,
    },
    {
      label: 'ツイート一覧',
      icon: <ListIcon />,
    },
    {
      label: 'リンク',
      icon: <BookmarkIcon />,
    },
  ];

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <EventRanking />
        <GiftLogList />
      </div>

      {/* 通知系 */}
      <Dialog />
      <Modal open={props.dialog.show} modalClose={props.closeModal}>
        {props.dialog.message}
      </Modal>
      <Snackbar open={props.notify.show} message={props.notify.message} variant={props.notify.type} closable={props.notify.closable} onClose={props.closeNotify} />
    </div>
  );
};

// state
const mapStateToProps = (state: RootState) => {
  return {
    notify: state.reducer.notify,
    dialog: state.reducer.dialog,
  };
};

// action
const mapDispatchToProps = {
  closeNotify: actions.closeNotify,
  closeModal: actions.closeDialog,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
