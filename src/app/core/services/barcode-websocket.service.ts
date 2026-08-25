import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BarcodeWebsocketService {
  private readonly barcodeSubject = new Subject<string>();
  private readonly connectionSubject = new Subject<boolean>();
  private readonly client: Client;
  private isActivated = false;

  readonly barcode$: Observable<string> = this.barcodeSubject.asObservable();
  readonly connected$: Observable<boolean> = this.connectionSubject.asObservable();

  constructor() {
    this.client = new Client({
      brokerURL: this.getBrokerUrl(),
      reconnectDelay: 5000,
      onConnect: () => {
        console.info('Barcode WebSocket connected');
        this.connectionSubject.next(true);
        this.client.subscribe('/topic/barcode-scan', (message: IMessage) => {
          const barcode = message.body.trim();
          if (barcode) {
            this.barcodeSubject.next(barcode);
          }
        });
      },
      onStompError: (frame) => {
        this.connectionSubject.next(false);
        console.error('Barcode WebSocket error:', frame.headers['message']);
      },
      onWebSocketError: (event) => {
        this.connectionSubject.next(false);
        console.error('Barcode WebSocket connection error:', event);
      },
      onWebSocketClose: () => {
        this.connectionSubject.next(false);
        console.warn('Barcode WebSocket disconnected; retrying automatically');
      }
    });
  }

  connect(): void {
    if (this.isActivated) {
      return;
    }

    this.isActivated = true;
    this.client.activate();
  }

  disconnect(): void {
    if (!this.isActivated) {
      return;
    }

    this.isActivated = false;
    void this.client.deactivate();
  }

  private getBrokerUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }
}
