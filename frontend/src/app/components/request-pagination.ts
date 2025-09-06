import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-request-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex justify-between items-center mt-4 bg-gray-100 px-4 py-2 rounded-md shadow-sm">
      <button
        (click)="prev.emit()"
        [disabled]="page <= 1"
        class="px-4 py-2 rounded-md font-medium
               transition
               disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
               bg-blue-600 text-white hover:bg-blue-700"
      >
        Prev
      </button>

      <span class="text-gray-700 font-semibold">Page {{ page }}</span>

      <button
        (click)="next.emit()"
        [disabled]="disableNext"
        class="px-4 py-2 rounded-md font-medium
               transition
               disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
               bg-blue-600 text-white hover:bg-blue-700"
      >
        Next
      </button>
    </div>
  `
})
export class RequestPaginationComponent {
  @Input() page = 1;
  @Input() disableNext = false;
  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
}
