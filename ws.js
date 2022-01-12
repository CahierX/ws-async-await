const WebSocket = require('ws');

class Ws {
  constructor(url) {
    this.webSocket = null;
    this.url = url;
    this.connectTimer = null;
  }

  initWebSocket() {
    return new Promise((resolve) => {
      this.webSocket = new WebSocket(this.url);
      if (this.webSocket) {
        this.webSocket.addEventListener('error', this.webSocketOnerror.bind(this));
        this.webSocket.addEventListener('close', this.webSocketOnClose.bind(this));
      }
      resolve(true);
    });
  }

  webSocketSend(data) {
    if (this.webSocket !== null && this.webSocket.readyState === 1) {
      data.params = { ...data.params, client: global.$mac ? 'mac' : 'windows' };
      const sendData = { ...data, timestamp: String(new Date().getTime()) };
      if (data.eventName !== 'ping') {
        console.log(`${process.platform} websocket send data:`, JSON.stringify(sendData));
      }
      this.webSocket.send(JSON.stringify(sendData));
    }
  }

  webSocketOnopen() {
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
    this.webSocketSend({ eventName: 'ping' });
  };

  webSocketOnerror(error) {
    if (this.webSocket && this.webSocket.readyState) {
      if (this.webSocket.readyState === 3) {
        this.webSocket = null;
        console.log(`${process.platform} webSocket err: `, error);
        this.initWebSocket();
      }
    }
  }

  webSocketOnClose() {
    console.log(`${process.platform} webSocket close reconnect`);
    this.initWebSocket();
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

  webSocketOnmessage() {
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

  async getWsData(eventName) {
    const data = await this.webSocketOnmessage(eventName);
    if (data) {
      if (data.eventName === eventName) {
        return data;
      } else {
        return await this.getWsData(eventName);
      }
    } else {
      return await this.getWsData(eventName);
    }
  };

  async sendWsData(data, key) {
    this.webSocketSend(data);
    return await this.getWsData(key);
  };
}
module.exports = Ws;
