import { Injectable } from '@angular/core';
import { WebExtensionMessage } from 'altair-graphql-core/build/types/messaging';
import { WindowService } from '../window.service';
import { debug } from '../../utils/logger';

@Injectable({
  providedIn: 'root',
})
export class WebExtensionsService {
  constructor(private windowService: WindowService) {}

  connect() {
    const browser = window.browser || window.chrome;

    if (!browser) {
      return;
    }

    browser.runtime.onMessage.addListener(
      (message: WebExtensionMessage, sender, sendResponse) => {
        debug.log('Message received in webextension service', message);
        switch (message.type) {
          case 'import-window': {
            // Import window from the message data
            this.windowService.importWindowData(message.window);
            return;
          }
          case 'ping': {
            browser.runtime.sendMessage({ type: 'pong' });
            return;
          }
          default: {
            debug.log('Unknown message type received', message);
            return;
          }
        }
      }
    );

    const readyMessage: WebExtensionMessage = { type: 'ready' };
    browser.runtime.sendMessage(readyMessage);
  }
}
