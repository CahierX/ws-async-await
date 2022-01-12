# ws-async-await
ws sends data and receives data into async await similar to http api interface
# how to use
```
 npm install ws-async-await
 ```
```typescript
  const ws = new Ws('ws://127.0.0.1:52234');
  await ws.initWebSocket();
  const macWsStatus = await ws.webSocketOnopen();
  if (macWsStatus) {
    const data = await ws.sendWsData('getTicket', { client: 'mac' });
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
  eventName: send ws eventName，
  params: send ws params
  reutrn ws receives the data returned by the data 

