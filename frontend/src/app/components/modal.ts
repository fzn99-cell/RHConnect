import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <div class="bg-white rounded shadow-lg p-6 w-1/3">
          <h2 class="text-xl font-bold mb-4">{{ title }}</h2>
          <div class="mb-4">
            <ng-content></ng-content>
          </div>
          <div class="text-right">
            <button class="bg-gray-300 px-4 py-2 rounded" (click)="close()">
              Close
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Output() closeModal = new EventEmitter<void>();

  close() {
    this.closeModal.emit();
  }
}
