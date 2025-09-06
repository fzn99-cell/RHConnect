import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `
    <button
      class="px-4 py-2 rounded font-medium transition"
      [class.bg-blue-600]="color === 'primary'"
      [class.text-white]="color === 'primary'"
      [class.hover\:bg-blue-700]="color === 'primary'"
      [class.bg-gray-200]="color === 'secondary'"
      [class.text-gray-800]="color === 'secondary'"
      [class.hover\:bg-gray-300]="color === 'secondary'"
    >
      <ng-content></ng-content>
    </button>
    
  `
})
export class ButtonComponent {
  @Input() color: 'primary' | 'secondary' = 'primary';
}
