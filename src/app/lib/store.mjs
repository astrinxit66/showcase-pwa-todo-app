/**
 * Created by jean-marc on 09/06/2018.
 */
import _ from 'lodash';
import {TodoAppDb} from '@app/lib/todo-app-db.mjs';


let state = null;
let idb = new TodoAppDb();
const subscribers = new Set();

export function createStore(reducer) {
  state = [];

  _rehydrateState().then(newState => newState.length > 0 && _notifyAll());

  return {

    dispatch(action) {
      if( !action ) {
        return;
      }

      if(action.type === undefined || action.type === null) {
        throw new Error('Action type required');
      }

      const currentState = _.cloneDeep( state );
      const newState = null || reducer(currentState, action);

      if(!_.isEqual(currentState, newState)) {
        _changeState( newState );
        _notifyAll();
      }
    },

    getState() { return _.cloneDeep( state ); },

    subscribe(listener) {
      listener();
      subscribers.add( listener );
    }
  };
}

export function unsbuscribe(subscriber = null) {
  !!subscriber ? subscribers.delete( subscriber ) : subscribers.clear();
}

function _notifyAll() {
  subscribers.forEach(listener => listener());
}

async function _rehydrateState() {
  state = await idb.getState() || [];
  return state;
}

function _changeState(newState) {
  state = newState;

  idb.update( newState );
}