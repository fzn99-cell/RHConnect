import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RequestStatus, RequestType, Department } from '../types/schema.types';

@Component({
  selector: 'app-request-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mb-4 bg-gray-100 p-4 rounded shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

        <select formControlName="status" class="border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Statuses</option>
          <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
        </select>

        <select formControlName="requestType" class="border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Types</option>
          <option *ngFor="let t of requestTypes" [value]="t">{{ getTypeLabel(t) }}</option>
        </select>

        <input formControlName="userId" type="number" placeholder="User ID" class="border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />

      </div>
      <button type="submit" class="w-full px-4 py-2 bg-blue-600 text-white rounded font-medium cursor-pointer disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition">
        Filter
      </button>
    </form>
  `
})
export class RequestFiltersComponent implements OnInit {
  fb = inject(FormBuilder);

  form!: FormGroup;

  @Input() departments: Department[] = [];
  @Input() statuses: RequestStatus[] = [];
  @Input() requestTypes: RequestType[] = [];
  @Input() typeLabels?: Partial<Record<RequestType, string>> = {};

  @Output() filterChange = new EventEmitter<{ status: RequestStatus | '', requestType: RequestType | '', userId: number | '' }>();

  ngOnInit(): void {
    this.form = this.fb.group({
      status: [''],
      requestType: [''],
      userId: ['']
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.filterChange.emit(this.form.value);
    }
  }

  getTypeLabel(type: RequestType): string {
    return this.typeLabels?.[type] ?? type;
  }
}
