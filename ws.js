const WebSocket = require('ws');

class ServiceWebSocket {
  constructor(url) {
    this.webSocket = null;
    this.url = url;
    this.connectTimer = null;
  }

  initServiceWebSocket() {
    return new Promise((resolve) => {
      this.webSocket = new WebSocket(this.url);
      if (this.webSocket) {
        this.webSocket.addEventListener('error', this.serviceWebSocketOnerror.bind(this));
        this.webSocket.addEventListener('close', this.serviceWebSocketOnClose.bind(this));
      }
      resolve(true);
    });
  }

  serviceWebSocketSend(data) {
    if (this.webSocket !== null && this.webSocket.readyState === 1) {
      data.params = { ...data.params, client: global.$mac ? 'mac' : 'windows' };
      const sendData = { ...data, timestamp: String(new Date().getTime()) };
      if (data.eventName !== 'ping') {
        console.log(`${process.platform} websocket send data:`, JSON.stringify(sendData));
      }
      this.webSocket.send(JSON.stringify(sendData));
    }
  }

  serviceWebSocketOnopen() {
    return new Promise((resolve) => {
      this.connectTimer = null;
      this.connectTimer = setInterval(() => this.checkConnect(), 60000);
      if (this.webSocket.readyState === 1) {
        resolve(true);
      } else {
        this.webSocket.onopen = () => {
          resolve(true);
        };
        this.webSocket.addEventListener('error', async (error) => {
          console.log(`${process.platform} websocket error:`, error);
          resolve(false);
        });
      }
    });
  }

  async checkConnect() {
    this.serviceWebSocketSend({ eventName: 'ping', msgId: Math.random() });
  };

  serviceWebSocketOnerror(error) {
    if (this.webSocket && this.webSocket.readyState) {
      if (this.webSocket.readyState === 3) {
        this.webSocket = null;
        console.log(`${process.platform} webSocket err: `, error);
        this.initServiceWebSocket();
      }
    }
  }

  serviceWebSocketOnClose() {
    console.log(`${process.platform} webSocket close reconnect`);
    this.initServiceWebSocket();
  }

  destroyWebSocket() {
    return new Promise((resolve) => {
      try {
        if (this.webSocket) {
          this.webSocket.close();
        }
      } catch (err) {
        console.log(`${process.platform} destroyWebSocket err:`, err);
      }
      resolve(true);
    });
  }

  serviceWebSocketOnmessage() {
    return new Promise((resolve) => {
      this.webSocket.onmessage = (e) => {
        if (this.webSocket) {
          const data = JSON.parse(e.data);
          if (data.eventName !== 'pong') {
            console.log(`${process.platform} websocket onmessage:`, data);
          }
          resolve(data);
        }
      };
    });
  }

  async getServiceWsData(eventName) {
    const data = await this.serviceWebSocketOnmessage(eventName);
    if (data) {
      if (data.eventName === eventName) {
        return data;
      } else {
        return await this.getServiceWsData(eventName);
      }
    } else {
      return await this.getServiceWsData(eventName);
    }
  };

  async sendWsData(eventName, params) {
    const msgId = Math.random();
    this.serviceWebSocketSend({
      eventName,
      msgId,
      params
    });
    return await this.getServiceWsData(eventName, msgId);
  };
}
module.exports = ServiceWebSocket;
(async () => {
  const ws = new ServiceWebSocket('ws://127.0.0.1:52234');
  await ws.initServiceWebSocket();
  const macWsStatus = await ws.serviceWebSocketOnopen();
  if (macWsStatus) {
    const data = await ws.sendWsData('getTicket', { client: 'mac' });
    console.log('%c [ data ]-156', 'font-size:13px; background:pink; color:#bf2c9f;', data);
  }
})();
