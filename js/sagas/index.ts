import { fork, select, call, put, take, takeEvery, race } from 'redux-saga/effects';
import * as actions from '../actions';
import { LineLiveComment, GiftMessage, fetchChannel, fetchEventRanking } from './lineUtil';
import { eventChannel } from 'redux-saga';

export default function* rootSaga() {
  yield call(fetchRanking);
  yield fork(setGeneratorFuncInterval, fetchRanking, 60 * 1000);
  // yield call(addChannel);
  yield takeEvery(actions.addChannelById, addChannel);
}

function* fetchRanking() {
  console.log('[fetchRanking]');
  try {
    const id = 6090;
    const result = yield call(fetchEventRanking, id);
    yield put(
      actions.updateRanking({
        id,
        rank: result,
      }),
    );
  } catch (e) {
    yield call(errorHandler, e);
  }
}

function* setGeneratorFuncInterval(func: any, msec: number) {
  const interval = (msec: number) =>
    eventChannel((emitter) => {
      const iv = setInterval(() => {
        emitter(msec);
      }, msec);
      // The subscriber must return an unsubscribe function
      return () => {
        clearInterval(iv);
      };
    });

  const channel = yield call(interval, msec);
  yield takeEvery(channel, func);
}

function* addChannel(action: ReturnType<typeof actions.addChannelById>) {
  try {
    console.log('[addChannel]');
    const channelId = action.payload;
    const channelInfo = yield call(fetchChannel, channelId);
    yield put(actions.addChannel(channelInfo));

    const socket = new LineLiveComment(channelId);
    socket.start();
    // socket.test();

    yield fork(socketAction, socket, channelId);
  } catch (e) {
    yield call(errorHandler, e);
  }
}

function* socketAction(socket: InstanceType<typeof LineLiveComment>, channelId: number) {
  const channel = yield call(() => {
    return eventChannel((emit) => {
      socket.on('comment', (e) => {
        console.log(e);
        if (e.comment.type === 'giftMessage') {
          emit(
            actions.updateBroadcastComment({
              channelId: e.channelId,
              broadcastId: e.broadcastId,
              comment: e.comment.data as GiftMessage['data'],
            }),
          );
        }
      });

      socket.on('start', () => {
        emit(
          actions.updateChannelStatus({
            channelId,
            status: 'start',
          }),
        );
      });

      socket.on('open', (e) => {
        emit(
          actions.updateChannelStatus({
            channelId,
            broadcastId: e.broadcastId,
            status: 'open',
          }),
        );
      });

      socket.on('error', (e) => {
        emit(
          actions.updateChannelStatus({
            channelId,
            status: 'error',
          }),
        );
      });

      const unsubscribe = () => {
        socket.on('comment', () => {
          //
        });
      };
      return unsubscribe;
    });
  });

  while (true) {
    const action = yield take(channel);
    yield put(action);
  }
}

function* errorHandler(error: any) {
  try {
    const message = (error.message as string) || '予期せぬエラーが発生しました。';
    yield put(actions.changeNotify(true, 'error', message));
    yield put(actions.updateStatus('error'));
  } catch (e) {
    console.error('★激辛だ★');
  }
}
