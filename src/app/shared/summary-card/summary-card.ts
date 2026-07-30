import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductionReportViewRow } from '../../features/filtrex/reports/models';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="summary-card">
      <div class="meta">
        <span class="sku">{{ data.sku }}</span>
        <span class="shift">Shift {{ data.shift }}</span>
      </div>

      <div class="counts">
        <div class="total">
          <label>Total</label>
          <strong>{{ data.totalCount }}</strong>
        </div>
        <div class="ok">
          <label>OK</label>
          <strong>{{ data.okCount }}</strong>
        </div>
        <div class="nok">
          <label>NOT OK</label>
          <strong>{{ data.notOkCount }}</strong>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .summary-card {
      background: #f9fafb;
      border-radius: 12px;
      padding: 10px;
    }

    .meta {
      display: flex;
      justify-content: space-between;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .counts {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }

    .counts div {
      border-radius: 10px;
      padding: 8px;
      text-align: center;
    }

    .total { background: #fef9c3; }
    .ok { background: #dcfce7; color: #166534; }
    .nok { background: #fee2e2; color: #991b1b; }
  `]
})
export class SummaryCardComponent {
  @Input() data!: ProductionReportViewRow;
}