import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // Prevent accidental F7 toggling browser caret browsing on text
  @HostListener('window:keydown', ['$event'])
  handleGlobalKey(e: KeyboardEvent): void {
    if (e.key === 'F7') {
      e.preventDefault();
    }
  }

  // Prevent blinking text caret line mark outside input boxes when clicking whitespace or card surfaces
  @HostListener('document:mousedown', ['$event'])
  @HostListener('document:click', ['$event'])
  handleGlobalClick(e: MouseEvent): void {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    if (!isInput) {
      setTimeout(() => {
        const sel = window.getSelection();
        if (sel && sel.isCollapsed) {
          sel.removeAllRanges();
        }
      }, 0);
    }
  }
}
