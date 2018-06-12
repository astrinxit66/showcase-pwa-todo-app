/**
 * Created by jean-marc on 09/06/2018.
 */

const isIdbSupported = 'indexedDB' in window;

export class TodoAppDb {

  constructor(storeName = 'todolist') {
    if( !isIdbSupported ) {
      console.warn('Data persisting is deactivated: browser does not support indexedDB');
      return;
    }

    const request = indexedDB.open('TodoApp', 1);

    this.storeName = storeName;

    this._connection = new Promise((resolve, reject) => {
      request.onsuccess = function _idbRequestSuccessHandler(successEvent) {
        const db = request.result;

        db.onerror = function _idbResultErrorHandler(errorEvent) {
          console.error(errorEvent);
          throw new Error('Indexeddb error');
        };

        resolve( db );
      };

      request.onerror = function _idbRequestErrorHandler(errorEvent) {
        console.error(errorEvent);
        reject( errorEvent.target.error );
      };

      request.onupgradeneeded = function _idbRequestSchemaUpgrade(versionChangeEvent) {
        const db = versionChangeEvent.target.result;
        db.createObjectStore( storeName );
      }
    });
  }

  async getState() {
    if( !isIdbSupported ) {
      return [];
    }

    const store = await this.transaction('readonly');
    const request = await store.get('state');

    return new Promise((resolve, reject) =>
      request.onsuccess = e => resolve( e.target.result )
    )
  }

  async update(newState) {
    if( !isIdbSupported ) {
      return;
    }

    const store = await this.transaction('readwrite');
    const keyRequest = await store.get('state');
    keyRequest.onsuccess = e =>
      !e.target.result ? store.add(newState, 'state') : store.put(newState, 'state');
  }

  async transaction( transactionMode ) {
    if( !isIdbSupported ) {
      return;
    }

    if(['readonly','readwrite'].indexOf( transactionMode) === -1) {
      throw new ReferenceError('Invalid transaction mode', transactionMode);
    }

    const db = await this._connection;
    const transaction = db.transaction([this.storeName], transactionMode);

    transaction.onerror = function _idbTransactionError(errorEvent) {
      throw new Error( errorEvent.target.error );
    };

    return transaction.objectStore( this.storeName );
  }
}