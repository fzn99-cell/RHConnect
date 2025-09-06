import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestType } from '../types/schema.types';

@Component({
  selector: 'app-dashboard-request-stats',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <ng-container *ngFor="let stat of stats">
        <div
          class="text-sm bg-white p-6 rounded-xl flex justify-between items-center w-full"
        >
          <div>{{ stat.label }}</div>
          <div class="font-bold text-xl">{{ stat.count }}</div>
        </div>
      </ng-container>
    </div>
  `,
})
export class DashboardRequestStats {
  @Input() requestTypes: RequestType[] = [];
  @Input() pendingCounts: Partial<Record<RequestType, number>> = {};
  @Input() typeLabels: Record<RequestType, string> = {} as Record<
    RequestType,
    string
  >;

  getLabel(type: RequestType): string {
    return this.typeLabels[type] || '';
  }

  getCount(type: RequestType): number {
    return this.pendingCounts[type] || 0;
  }

  get stats(): { type: RequestType; label: string; count: number }[] {
    return this.requestTypes.map((type) => ({
      type,
      label: this.typeLabels[type] || '',
      count: this.pendingCounts[type] || 0,
    }));
  }
}
