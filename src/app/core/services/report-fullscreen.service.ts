import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReportFullscreenService {
  isFullscreen = signal(false);

  setFullscreen(value: boolean): void {
    this.isFullscreen.set(value);
  }
}
