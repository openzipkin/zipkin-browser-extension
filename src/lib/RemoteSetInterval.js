export function RemoteSetIntervalClient(pubsub) {
  let internalIntervalId = 0;
  const callbacks = [];
  pubsub.sub('setInterval.response', ({ intervalId }) => {
    console.log('Client: received setInterval poll', intervalId);
    if (callbacks[intervalId]) {
      callbacks[intervalId].call();
    }
  });

  function setInterval(callback, interval) {
    console.log(
      'Client: Now setting up remote setInterval',
      internalIntervalId,
    );
    pubsub.pub('setInterval.request', {
      intervalId: internalIntervalId,
      interval,
    });
    callbacks[internalIntervalId] = callback;
    internalIntervalId++;
  }
  function clearInterval(callback) {
    const intervalId = callbacks.indexOf(callback);
    if (intervalId !== -1) {
      pubsub.pub('setInterval.clear', { intervalId });
      delete callbacks[intervalId];
    }
  }

  return {
    setInterval,
    clearInterval,
  };
}

export function RemoteSetIntervalServer(pubsub, setInterval, clearInterval) {
  const responders = [];

  function makeResponder(intervalId) {
    console.log('Server: sending setInterval poll', intervalId);
    return () => pubsub.pub('setInterval.response', { intervalId });
  }

  pubsub.sub('setInterval.request', ({ intervalId, interval }) => {
    console.log('Server: Received request for setInterval', intervalId);
    responders[intervalId] = makeResponder(intervalId);
    setInterval(responders[intervalId], interval);
  });

  pubsub.sub('setInterval.clear', ({ intervalId }) => {
    clearInterval(responders[intervalId]);
    delete responders[intervalId];
  });
}
