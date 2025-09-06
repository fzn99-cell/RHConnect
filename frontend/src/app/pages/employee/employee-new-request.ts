import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { RequestType } from '../../types/schema.types';
import { RequestService } from '../../services/request.service';
import { RequestTypeLabels } from '../../types/enumsWithFrenchLabels';

@Component({
  selector: 'app-new-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="w-full bg-white p-6 rounded-xl">
      <h2 class="text-2xl font-bold mb-4">Soumettre une demande</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Request Type -->
        <label class="block font-semibold mb-1">Type de demande</label>
        <select
          formControlName="requestType"
          class="w-full mb-4 border rounded px-3 py-2"
        >
          <option value="" disabled>Sélectionnez le type de demande</option>
          <option *ngFor="let type of requestTypes" [value]="type">
            {{ RequestTypeLabels[type] }}
          </option>
        </select>

        <!-- Description -->
        <label class="block font-semibold mb-1">Description</label>
        <textarea
          formControlName="description"
          rows="3"
          class="w-full mb-4 border rounded px-3 py-2"
          placeholder="Décrivez votre demande"
        ></textarea>

        <!-- Conditional Fields -->
        <ng-container [ngSwitch]="form.get('requestType')?.value">
          <ng-container *ngSwitchCase="RequestType.leave">
            <label class="block">Date de début</label>
            <input
              type="date"
              formControlName="startDate"
              class="w-full mb-2 border px-2 py-1 rounded"
            />
            <label class="block">Date de fin</label>
            <input
              type="date"
              formControlName="endDate"
              class="w-full mb-4 border px-2 py-1 rounded"
            />
          </ng-container>

          <ng-container *ngSwitchCase="RequestType.sickLeave">
            <label class="block">Date de début</label>
            <input
              type="date"
              formControlName="startDate"
              class="w-full mb-2 border px-2 py-1 rounded"
            />
            <label class="block">Date de fin</label>
            <input
              type="date"
              formControlName="endDate"
              class="w-full mb-2 border px-2 py-1 rounded"
            />
            <label class="block">Nombre de jours de maladie</label>
            <input
              type="number"
              formControlName="sickDays"
              class="w-full mb-4 border px-2 py-1 rounded"
            />
            <label class="block font-semibold mb-1"
              >Joindre un fichier (optionnel, PDF/JPG/PNG ≤10Mo)</label
            >
            <input
              type="file"
              (change)="onFileChange($event)"
              accept=".pdf,.png,.jpg,.jpeg"
              class="mb-4"
            />
            <div
              *ngIf="fileName"
              class="mb-4 text-sm flex items-center justify-between"
            >
              <span>{{ fileName }}</span>
              <button
                type="button"
                (click)="removeFile()"
                class="text-red-500 text-xs ml-2"
              >
                Supprimer
              </button>
            </div>
          </ng-container>

          <ng-container *ngSwitchCase="RequestType.payslip">
            <label class="block">Mode de livraison</label>
            <select
              formControlName="deliveryMode"
              class="w-full mb-4 border px-2 py-1 rounded"
            >
              <option value="" disabled>
                Sélectionnez le mode de livraison
              </option>
              <option value="email">Télécharger</option>
              <option value="post">En Personne</option>
            </select>
          </ng-container>

          <ng-container *ngSwitchCase="RequestType.medicalFileUpdate">
            <label class="block">Medical Record ID</label>
            <input
              type="text"
              formControlName="mrid"
              class="w-full mb-4 border px-2 py-1 rounded"
            />
          </ng-container>

          <ng-container *ngSwitchCase="RequestType.workCertificate">
            <label class="block">Objet (optionnel)</label>
            <input
              type="text"
              formControlName="purpose"
              class="w-full mb-4 border px-2 py-1 rounded"
            />
          </ng-container>

          <ng-container *ngSwitchCase="RequestType.complaint">
            <label class="block font-semibold mb-1"
              >Joindre un fichier (optionnel, PDF/JPG/PNG ≤10Mo)</label
            >
            <input
              type="file"
              (change)="onFileChange($event)"
              accept=".pdf,.png,.jpg,.jpeg"
              class="mb-4"
            />
            <div
              *ngIf="fileName"
              class="mb-4 text-sm flex items-center justify-between"
            >
              <span>{{ fileName }}</span>
              <button
                type="button"
                (click)="removeFile()"
                class="text-red-500 text-xs ml-2"
              >
                Supprimer
              </button>
            </div>
          </ng-container>
        </ng-container>

        <!-- Feedback -->
        <div *ngIf="errorMsg" class="text-red-500 mb-2">{{ errorMsg }}</div>
        <div *ngIf="successMsg" class="text-green-600 mb-2">
          {{ successMsg }}
        </div>

        <!-- Submit -->
        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          [disabled]="form.invalid || submitting"
        >
          {{ submitting ? 'Envoi en cours...' : 'Envoyer' }}
        </button>
      </form>
    </div>
  `,
})
export class NewRequest implements OnInit {
  private fb = inject(FormBuilder);
  private requestService = inject(RequestService);
  RequestTypeLabels = RequestTypeLabels;

  form!: FormGroup;
  submitting = false;
  errorMsg = '';
  successMsg = '';
  fileName = '';

  RequestType = RequestType;
  requestTypes = Object.values(RequestType);

  ngOnInit(): void {
    this.form = this.fb.group({
      requestType: ['', Validators.required],
      description: ['', Validators.required],
      startDate: [null],
      endDate: [null],
      sickDays: [null],
      deliveryMode: [''],
      purpose: [''],
      mrid: [''],
      file: [null],
    });

    this.form
      .get('requestType')
      ?.valueChanges.subscribe(() => this.resetSubFields());
  }

  resetSubFields(): void {
    this.form.patchValue({
      startDate: null,
      endDate: null,
      sickDays: null,
      deliveryMode: '',
      purpose: '',
      mrid: '',
      file: null,
    });
    this.fileName = '';
  }

  removeFile(): void {
    this.form.patchValue({ file: null });
    this.fileName = '';
  }

  onFileChange(event: Event): void {
    this.errorMsg = '';
    const file = (event.target as HTMLInputElement).files?.[0] || null;

    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        this.errorMsg = 'Invalid file type. Only PDF, JPG, PNG allowed.';
        this.form.patchValue({ file: null });
        this.fileName = '';
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        this.errorMsg = 'File must be ≤ 10MB';
        this.form.patchValue({ file: null });
        this.fileName = '';
      } else {
        this.form.patchValue({ file });
        this.fileName = file.name;
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.errorMsg = 'Fill all required fields.';
      return;
    }

    this.submitting = true;
    this.errorMsg = '';
    this.successMsg = '';

    const fv = this.form.getRawValue();
    const formData = new FormData();

    formData.append('requestType', fv.requestType);
    formData.append('description', fv.description);
    formData.append(
      'subRequestData',
      JSON.stringify({
        startDate: fv.startDate,
        endDate: fv.endDate,
        sickDays: fv.sickDays,
        deliveryMode: fv.deliveryMode,
        purpose: fv.purpose,
        mrid: fv.mrid,
      }),
    );

    if (fv.file) {
      formData.append('file', fv.file);
    }

    try {
      await firstValueFrom(this.requestService.submitRequest(formData));
      this.successMsg = 'Request submitted successfully.';
      this.form.reset();
      this.fileName = '';
    } catch (err: any) {
      this.errorMsg =
        err?.error?.message || 'Submission failed. Please try again.';
    } finally {
      this.submitting = false;
    }
  }
}
