# ws-async-await
ws sends data and receives data into async await similar to http api interface
# how to use
```typescript
 const ws = new Ws('ws://127.0.0.1:52234');
  await ws.initWebSocket();
  const macWsStatus = await ws.webSocketOnopen();
  if (macWsStatus) {
    const data = await ws.sendWsData({ eventName: 'getTicket', params: { client: 'mac' } }, 'eventName');
    console.log(data);
  }
```
# Functions
## initWebSocket
 init ws
## webSocketOnopen
  await ws open return boolean status 
## sendWsData(eventName,params)
  sendWsData is a promise function, await will return ws onmessage data, provided the eventName is the same as the sent eventName
  data: send ws data，
  key: ws return data key = we set key ,it ws return this data

