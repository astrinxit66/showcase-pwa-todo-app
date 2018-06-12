/**
 * Created by jean-marc on 08/06/2018.
 */
import _ from 'lodash';
import {createStore} from '@app/lib/store';

const Action = {ADD: 0, REMOVE: 1, MARK_DONE: 2, MARK_UNDONE: 3};

const store = createStore( _storeHandler );
const addInputEl = document.querySelector('input#add');
const todoContainerEl = document.querySelector('tbody');

store.subscribe( _render );


addInputEl.addEventListener('keypress', e => {
  if(e.keyCode !== 13) {
    return;
  }

  store.dispatch({type: Action.ADD, payload: e.target.value});
  e.target.value = '';
});


window.addEventListener('load', e => {
  if('serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.register('/sw.js');
      console.log('SW registered');
    } catch(error) {
      console.error('SW failed to register', error);
    }
  }
});


function _render() {
  todoContainerEl.innerHTML = '';

  store.getState().forEach((todo, index) => {
    const
      rowEl = document.createElement('tr'),
      doneEl = document.createElement('td'),
      todoEl = document.createElement('td'),
      optionsEl = document.createElement('td');

      doneEl.innerHTML = `<input type="checkbox" id="todo${index}" value="${todo.label}" ${todo.isDone ? 'checked="true"' : ''}">`;
      doneEl.addEventListener('click', e =>
        store.dispatch({type: e.target.checked ? Action.MARK_DONE : Action.MARK_UNDONE, payload: todo})
      );

      todoEl.innerHTML = `<label for="todo${index}" ${todo.isDone ? 'class="done"' : ''}>${todo.label}</label>`;

      optionsEl.innerHTML = `<button>Supprimer</button>`;
      optionsEl.querySelector('button').addEventListener('click', _ => store.dispatch({type: Action.REMOVE, payload: todo}));

      rowEl.appendChild( doneEl );
      rowEl.appendChild( todoEl );
      rowEl.appendChild( optionsEl );

      todoContainerEl.appendChild( rowEl );
  });
}

function _storeHandler(state, action) {
  let newState = _.cloneDeep( state );

  switch( action.type ) {
    case Action.ADD:
      newState.push({label: action.payload, isDone: false});
      break;

    case Action.REMOVE:
      newState = state.filter(value => value.label !== action.payload.label);
      break;

    case Action.MARK_DONE:
    case Action.MARK_UNDONE:
      newState = newState.map(value => {
        if(value.label === action.payload.label) {
          value.isDone = action.type === Action.MARK_DONE;
        }

        return value;
      });
      break;
  }

  return newState;
}