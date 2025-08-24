import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestType } from '../types/schema.types';

@Component({
  selector: 'app-request-stats',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <ng-container *ngFor="let type of requestTypes">
        <div
          class="text-sm bg-white p-6 rounded-xl flex justify-between items-center w-full"
        >
          <div>{{ typeLabels[type] }}</div>
          <div class="font-bold text-xl">{{ pendingCounts[type] || 0 }}</div>
        </div>
      </ng-container>
    </div>
  `,
})
export class RequestStats {
  @Input() requestTypes: RequestType[] = [];
  @Input() pendingCounts: Partial<Record<RequestType, number>> = {};
  @Input() typeLabels: Record<RequestType, string> = {} as Record<
    RequestType,
    string
  >;
}
