import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorService } from '../../../core/services/error.service';

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-display.component.html',
  styleUrls: ['./error-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorDisplayComponent implements OnInit {
  private errorService = inject(ErrorService);
  error$ = this.errorService.error$;

  ngOnInit() {
    // Auto-clear error after 3 seconds
    setInterval(() => {
      if (this.error$().hasError) {
        const elapsed = new Date().getTime() - this.error$().timestamp.getTime();
        if (elapsed > 3000) {
          this.dismissError();
        }
      }
    }, 1000);
  }

  dismissError() {
    this.errorService.clearError();
  }
}
