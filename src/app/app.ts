import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BarcodeWebsocketService } from './core/services/barcode-websocket.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('NextFirstFiltrexFrontend');

  constructor(barcodeWebsocketService: BarcodeWebsocketService) {
    barcodeWebsocketService.connect();
  }
}
