export default class ASRClient {
  constructor(websocketUrl) {
    this.websocketUrl = websocketUrl;
    this.socket = null;
    this.mediaRecorder = null;
    this.audioContext = null;
    this.stream = null;
    this.isRecording = false;
    this.callbacks = {
      onReady: null,
      onStart: null,
      onPartialResult: null,
      onFinalResult: null,
      onComplete: null,
      onError: null
    };
  }

  // 初始化WebSocket连接
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem('token');
        this.socket = new WebSocket(`${this.websocketUrl}?token=${token}`);

        this.socket.onopen = () => {
          console.log('WebSocket连接已建立');
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data);
            this._handleResponse(response);
          } catch (error) {
            console.error('处理服务器消息时出错:', error);
            if (this.callbacks.onError) {
              this.callbacks.onError('处理服务器消息时出错: ' + error.message);
            }
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket错误:', error);
          if (this.callbacks.onError) {
            this.callbacks.onError('WebSocket连接错误');
          }
          reject(error);
        };

        this.socket.onclose = (event) => {
          console.log('WebSocket连接已关闭:', event.code, event.reason);
          this._stopRecording();
        };
      } catch (error) {
        console.error('建立WebSocket连接时出错:', error);
        reject(error);
      }
    });
  }

  // 处理服务器响应
  _handleResponse(response) {
    // const { type, data } = response;
    console.log(response.type);
     console.log(response.data);

    switch (response.type) {
      case 'ready':
        console.log('ASR会话已就绪');
        if (this.callbacks.onReady) this.callbacks.onReady();
        break;
      case 'started':
        console.log('ASR识别已开始');
        if (this.callbacks.onStart) this.callbacks.onStart(data);
        break;
      case 'partial':
        if (this.callbacks.onPartialResult) {
          this.callbacks.onPartialResult(response.data || '');
        }
        break;
      case 'final':
        if (this.callbacks.onFinalResult) {
          this.callbacks.onFinalResult(data || '');
        }
        break;
      case 'complete':
        console.log('ASR识别已完成');
        if (this.callbacks.onComplete) this.callbacks.onComplete();
        break;
      case 'error':
        console.error('ASR错误:', data);
        if (this.callbacks.onError) {
          if (typeof data === 'string') {
            this.callbacks.onError(data);
          } else if (data.errorMsg) {
            this.callbacks.onError(data.errorMsg);
          } else {
            this.callbacks.onError('未知错误');
          }
        }
        break;
      case 'stopped':
        console.log('ASR会话已停止');
        break;
      default:
        console.log('未知响应类型:', type, data);
    }
  }

  // 设置回调函数
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // 开始录音和识别
  async startRecognition() {
    if (this.isRecording) return;
    try {
      // 请求麦克风权限
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 初始化AudioContext
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      const source = this.audioContext.createMediaStreamSource(this.stream);

      // 设置音频处理节点
      const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      source.connect(processor);
      processor.connect(this.audioContext.destination);

      // 确保WebSocket是连接状态
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        await this.connect();
      }

      // 处理音频数据
      processor.onaudioprocess = (e) => {
        if (!this.isRecording) return;

        // 获取PCM数据
        const inputData = e.inputBuffer.getChannelData(0);

        // 转换为16位整数
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.min(1, Math.max(-1, inputData[i])) * 0x7FFF;
        }

        // 发送到服务器
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(pcmData.buffer);
        }
      };

      this.isRecording = true;
      console.log('开始录音和识别');

      // 保存引用以便停止
      this._audioProcessor = processor;
      this._audioSource = source;

    } catch (error) {
      console.error('开始录音时出错:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError('开始录音时出错: ' + error.message);
      }
    }
  }

  // 停止录音和识别
  stopRecognition() {
    if (!this.isRecording) return;
    console.log('stopRecognition');

    // 停止录音
    this._stopRecording();

    // 通知服务器停止识别
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ command: 'stop' }));
    }
  }

  // 停止录音逻辑
  _stopRecording() {
    this.isRecording = false;

    // 清理音频处理
    if (this._audioProcessor && this._audioSource) {
      this._audioSource.disconnect();
      this._audioProcessor.disconnect();
      this._audioProcessor = null;
      this._audioSource = null;
    }

    // 停止媒体流
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    // 关闭音频上下文
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(console.error);
      this.audioContext = null;
    }

    console.log('已停止录音');
  }

  // 关闭连接
  disconnect() {
    this.stopRecognition();

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    console.log('已断开连接');
  }
}
