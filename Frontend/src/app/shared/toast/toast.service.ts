import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  show(type: ToastMessage['type'], message: string, title?: string, duration = 4000): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastMessage = { id, type, message, title, duration };

    this.toasts.update(list => [...list, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  success(message: string, title = 'Success'): void {
    this.show('success', message, title, 3500);
  }

  error(message: string, title = 'Error'): void {
    // 0 means no auto-dismiss: requires user to click OK or Close button
    this.show('danger', message, title, 0);
  }

  warning(message: string, title = 'Warning'): void {
    this.show('warning', message, title, 4000);
  }

  info(message: string, title = 'Information'): void {
    this.show('info', message, title, 3500);
  }

  dismiss(id: string): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
