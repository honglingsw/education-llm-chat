class AudioPlayer {
  #audioContext;
  #playQueue = []; // 当前播放队列
  #cacheQueue = []; // 缓存队列
  #textQueue = []; // 文本队列
  #currentSource = null; // 当前播放的音频源
  #isPlaying = false; // 是否正在播放
  #isPaused = false; // 是否暂停
  #ws;
  #onStatusChange;
  #onProgressUpdate;
  #onLog;
  #MAX_TEXT_LENGTH = 100; // 单段最大文本长度
  #isRequesting = false; // 是否正在请求音频数据
  #modelTextCache = ""; // 模型生成的累计文本
  #modelPlayQueue = []; // 模型播放队列
  #pendingSplitQueue = ""; // 待拆分队列（用于存储当前无法拆分的内容）
  #token = "";
  #requestId = 0; // 自增请求 ID，用于唯一标识每段文本

  constructor(wsUrl, onStatusChange, onProgressUpdate, onLog) {
      this.#audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.#ws = new WebSocket(wsUrl);
      this.#onStatusChange = onStatusChange;
      this.#onProgressUpdate = onProgressUpdate;
      this.#onLog = onLog;
      this.#token = 'eyJhbGciOiJIUzUxMiJ9.eyJwaG9uZSI6IjEzMjA2NTkwMjM2IiwidXNlcklkIjoxMTExMTEsImlhdCI6MTc0MzEyNTg3NiwiZXhwIjoxNzQzNzMwNjc2fQ.EssRZG_b3CrJ0UW3iR311evKUMWZb_OPjE234Or1yf1yas_hw5odj6Sg7nudBQwYq54yroNERjxzztNTP14Pvg';

      this.#ws.binaryType = 'arraybuffer';

      this.#ws.onopen = () => {
          this.#log('WebSocket 已连接');
          this.#onStatusChange?.('connected');
      };

      this.#ws.onclose = () => {
          this.#log('WebSocket 已断开');
          this.#onStatusChange?.('disconnected');
      };

      this.#ws.onerror = (error) => {
          this.#log('WebSocket 错误: ' + error.message, 'error');
          this.#onStatusChange?.('error');
      };

      this.#ws.onmessage = async (event) => {
          try {
              const rawData = event.data;

              // 假设后端返回的数据是 JSON 格式，包含 id 和音频数据
              const { id, audioData: base64AudioData } = JSON.parse(rawData);

              // 将 Base64 字符串转换为 ArrayBuffer
              const binaryString = atob(base64AudioData); // 解码 Base64
              const len = binaryString.length;
              const arrayBuffer = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                  arrayBuffer[i] = binaryString.charCodeAt(i);
              }

              // 解码音频数据
              const audioBuffer = await this.#audioContext.decodeAudioData(arrayBuffer.buffer);

              // 将音频数据和 ID 存储到缓存队列
              this.#cacheQueue.push({ id, buffer: audioBuffer });
              this.#log(`收到音频数据，ID: ${id}`);

              // 请求完成
              this.#isRequesting = false;

              // 如果没有正在播放且未暂停，立即播放
              if (!this.#isPlaying && !this.#isPaused) {
                  this.#playNext();
              }
          } catch (error) {
              this.#log('处理音频数据时出错: ' + error.message, 'error');
              this.#isRequesting = false; // 标记请求完成，避免卡住队列
          }
      };
  }

  #log(message, type = 'info') {
      console.log(`[AudioPlayer] ${message}`);
      this.#onLog?.({ message, type });
  }

  #splitText(text) {
      // 使用句号或其他标点符号作为分隔符，同时保留分隔符
      const segments = text.match(/[^。！？.!?]*[。！？.!?]?/g) || [text];
      const result = [];

      for (const segment of segments) {
          if (!segment) continue; // 跳过空段落
          result.push(segment); // 直接将每个段落加入结果
      }

      return result;
  }

  async #processQueue() {

      if (this.#textQueue.length === 0) {
      // if (this.#isRequesting || this.#textQueue.length === 0) {
          return;
      }

      this.#isRequesting = true;


      const texts = this.#textQueue.splice(0, 2); // 每次取两段文本
       this.#log(`获取到内容: ${texts}`);
      if (this.#ws.readyState !== WebSocket.OPEN) {
          this.#log('WebSocket 未连接，无法请求音频数据', 'error');
          this.#isRequesting = false;
          return;
      }

      for (const text of texts) {
          const id = this.#requestId++; // 生成唯一的顺序 ID
          const jsonMessage = { id, text, timestamp: Date.now(), type: 'text' };

          // 向后端发送请求
          this.#ws.send(JSON.stringify(jsonMessage));
          this.#log(`发送文本到服务端: ${text}, ID: ${id}`);
      }
  }

  #playNext() {
      // 如果播放队列为空且缓存队列有数据，将缓存队列的音频移入播放队列
      if (this.#playQueue.length === 0 && this.#cacheQueue.length > 0) {
          // 按 ID 排序缓存队列，确保顺序一致
          this.#cacheQueue.sort((a, b) => a.id - b.id);

          // 将排序后的音频数据移入播放队列
          this.#playQueue.push(...this.#cacheQueue.map(item => item.buffer));
          this.#cacheQueue = [];
      }

      if (this.#playQueue.length === 0 || this.#isPaused) {
          this.#isPlaying = false;
          return;
      }

      const audioBuffer = this.#playQueue.shift(); // 从播放队列中取出第一个音频
      const source = this.#audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.#audioContext.destination);

      this.#currentSource = source;
      this.#isPlaying = true;

      source.onended = () => {
          this.#currentSource = null;
          this.#isPlaying = false;

          // 播放结束后，继续播放下一段音频
          this.#playNext();
      };
      this.#processQueue();
      source.start();
      this.#log('开始播放音频');
  }

  synthesizeText(text) {
      if (!this.isConnected()) {
          this.#log('WebSocket 未连接', 'error');
          return;
      }

      const textSegments = this.#splitText(text);
      this.#textQueue.push(...textSegments);
      this.#log(`添加了 ${textSegments.length} 段文本到队列`);

      // 开始处理文本队列
      this.#processQueue();
  }

  pause() {
  if (!this.#isPlaying || !this.#currentSource) return;

  // 暂停 AudioContext
  this.#audioContext.suspend().then(() => {
      this.#isPaused = true;
      this.#log('暂停播放');
  });
}

resume() {
  if (!this.#isPaused) return;

  // 恢复 AudioContext
  this.#audioContext.resume().then(() => {
      this.#isPaused = false;
      this.#log('恢复播放');
  });
}

stop() {
  if (this.#currentSource) {
      this.#currentSource.stop(); // 完全停止当前音频
      this.#currentSource = null;
  }

  // 清空队列和状态
  this.#playQueue = [];
  this.#cacheQueue = [];
  this.#textQueue = [];
  this.#isPaused = false;
  this.#isPlaying = false;

  // 关闭 AudioContext
  if (this.#audioContext.state !== 'closed') {
      this.#audioContext.close().then(() => {
          this.#log('停止播放并清空队列');
      });
  }
}


  disconnect() {
      this.stop();
      if (this.#ws) {
          this.#ws.close();
      }
      this.#log('断开连接');
  }

  isConnected() {
      return this.#ws?.readyState === WebSocket.OPEN;
  }

 async fetchAnswer(questionId) {
      try {
          const response = await fetch('http://localhost:8080/api/exam/demoAnswner', {
              method: 'POST',
              headers: {
                  'accept': '*/*',
                  'content-type': 'application/json',
                  'authorization': `Bearer ${this.#token}`,
              },
              body: JSON.stringify({ questionId }),
          });

          if (!response.ok) {
              throw new Error('Network response was not ok');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let accumulatedText = '';

          while (true) {
              const { value, done } = await reader.read();
              if (done) {

                  this.#finalizePendingText();
                  break;
              }

              const chunk = decoder.decode(value);
              const messages = chunk.split('\n').filter(line => line.trim());

              for (const message of messages) {
                  if (message.startsWith('data:')) {
                      try {
                          const jsonStr = message.slice(5).trim();
                          if (jsonStr) {
                              const data = JSON.parse(jsonStr);
                              if (data.contentType === 'answer' && data.content) {
                                  const content = data.content.trim();
                                  if (content && !content.match(/^[,\s]+$/)) {
                                      accumulatedText += content;
                                      document.getElementById('answerText').textContent = accumulatedText;

                                      // 模型生成的文本处理
                                      this.#modelTextCache += content;

                                      this.#handleTextAccumulation(content);

                                      // if (this.#modelTextCache.length >= 100) {
                                      //     this.#textQueue.push(this.#modelTextCache);
                                      //     // const textSegments = this.#splitText(this.#modelTextCache);
                                      //     this.#modelPlayQueue.push(this.#modelTextCache);
                                      //     this.#modelTextCache = ''; // 清空累计文本
                                      //     this.#processQueue();

                                      //     // textSegments.forEach(segment => this.synthesizeText(segment));
                                      // }
                                  }
                              }
                          }
                      } catch (e) {
                          console.error('JSON解析错误:', e);
                      }
                  }
              }
          }

          return accumulatedText;
      } catch (error) {
          console.error('Error:', error);
          throw error;
      }
  }

  // 在连接结束时强制处理剩余文本
  #finalizePendingText() {
      this.#log(`处理剩余的文本: ${this.#pendingSplitQueue}`);
  if (this.#pendingSplitQueue) {
      this.#textQueue.push(this.#pendingSplitQueue); // 强制加入播放队列
      this.#pendingSplitQueue = ''; // 清空待拆分队列
      this.#processQueue(); // 处理队列
  }
}


  #handleTextAccumulation(newContent) {
      this.#log(`需要拆分文本: ${newContent}`);

      // 将新内容与待拆分队列合并
      const combinedContent = this.#pendingSplitQueue + newContent;

      // 尝试拆分
      const textSegments = this.#splitText(combinedContent);

      // 如果拆分后有完整的段落，则加入播放队列
      if (textSegments.length > 0) {
          const completeSegments = textSegments.slice(0, -1); // 完整的段落
          this.#textQueue.push(...completeSegments);

          // 更新待拆分队列
          this.#pendingSplitQueue = textSegments[textSegments.length - 1] || ''; // 防止 undefined
      } else {
          // 如果无法拆分，则继续累积
          this.#pendingSplitQueue = combinedContent;
      }

      this.#log(`当前剩余的文本: ${this.#pendingSplitQueue}`);

      // 处理队列
      this.#processQueue();
  }
}
