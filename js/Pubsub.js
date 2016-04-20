function consoleDebug(msg) {
  // This can be uncommented for more debugging
  // console.log(msg);
}

export default class Pubsub {
  constructor() {
    this.handlers = {};
    this.queryId = 0;
  }

  query(topic, message, callback) {
    consoleDebug('query for '+topic, message);
    const currentQueryId = this.queryId;
    const cb = reply => {
      if (reply.queryId === currentQueryId) {
        consoleDebug('got reply for '+topic, reply);
        this.unsub(cb);
        callback(reply.response);
      }
    };
    this.sub(topic+'.response', cb);
    this.pub(topic+'.request', {
      queryId: currentQueryId,
      query: message
    });
    this.queryId++;
  }

  serve(topic, handler) {
    consoleDebug('set up server for '+topic);
    this.sub(topic+'.request', ({queryId, query}) => {
      consoleDebug('received request for '+topic+ '(id='+queryId+')', query);
      handler(query, response => {
        consoleDebug('the handler for '+topic+' was finished, responding with', response);
        this.pub(topic+'.response', {queryId, response});
      });
    });
  }

  // pub(topic, message) {} is abstract and
  // should be implemented by pubsub implementations.

  notifySubscribers(topic, message) {
    if (this.handlers[topic]) {
      consoleDebug('notifying subscriber for '+topic, message);
      this.handlers[topic].forEach(listener => listener(message));
    }
  }

  sub(topic, listener) {
    consoleDebug('before sub, listeners are', this.handlers[topic]);
    this.handlers[topic] = this.handlers[topic] || [];
    consoleDebug('attaching listener', listener);
    this.handlers[topic].push(listener);
    consoleDebug('all handlers are now', this.handlers);
    this.handlers[topic].forEach(handler => {
      consoleDebug('the type of handler is', handler);
    });
  }

  unsub(topic, listener) {
    consoleDebug('before unsub, listeners are', this.handlers[topic]);
    if (this.handlers[topic]) {
      this.handlers[topic].splice(this.handlers[topic].indexOf(listener), 1);
    }
    consoleDebug('after unsub, listeners are', this.handlers[topic]);
  }
}
