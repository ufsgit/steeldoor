import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { District } from '../../../core/models';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 sm:space-y-16 animate-fadeIn">
      <!-- Header -->
      <div class="text-center max-w-2xl mx-auto space-y-3">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-text tracking-tight">
          Contact Us
        </h1>
        <p class="text-sm sm:text-base text-text-muted leading-relaxed">
          Get in touch with our central desk or your local district branch for inquiries and fitting requests.
        </p>
      </div>

      <!-- Quick Connect Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Phone -->
        <div class="p-8 rounded-3xl bg-surface border border-border shadow-soft space-y-3 hover:border-primary/40 transition-all">
          <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-text">Phone Support</h2>
            <p class="text-xs text-text-muted mt-1">Direct assistance for booking and schedules.</p>
          </div>
          <div class="pt-2">
            <a href="tel:18004253667" class="text-base font-extrabold text-primary hover:text-primary-hover flex items-center gap-1.5">
              <span>+91 1800-425-DOOR</span>
            </a>
            <span class="text-[11px] text-text-muted block mt-0.5">Mon - Sat: 8:00 AM - 7:00 PM</span>
          </div>
        </div>

        <!-- WhatsApp -->
        <div class="p-8 rounded-3xl bg-surface border border-border shadow-soft space-y-3 hover:border-emerald-500/40 transition-all">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.288.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086.159.058 1.011.477 1.184.564.173.086.289.13.332.202.043.073.043.419-.101.824z"/>
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-text">WhatsApp Chat</h2>
            <p class="text-xs text-text-muted mt-1">Send photos and dimensions for quick estimates.</p>
          </div>
          <div class="pt-2">
            <a href="https://wa.me/919847012345" target="_blank" rel="noopener" class="text-base font-extrabold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5">
              <span>+91 98470 12345</span>
            </a>
            <span class="text-[11px] text-text-muted block mt-0.5">Quick response</span>
          </div>
        </div>

        <!-- Headquarters -->
        <div class="p-8 rounded-3xl bg-surface border border-border shadow-soft space-y-3 hover:border-primary/40 transition-all">
          <div class="w-12 h-12 rounded-2xl bg-accent/20 text-accent-dark flex items-center justify-center font-bold">
            <svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-text">Main Office</h2>
            <p class="text-xs text-text-muted mt-1">Central coordination and management.</p>
          </div>
          <div class="pt-2">
            <span class="text-xs font-semibold text-text block">SteelGuard Systems Pvt Ltd</span>
            <span class="text-[11px] text-text-muted block leading-snug">Infopark Expressway, Kakkanad, Ernakulam, Kerala 682030</span>
          </div>
        </div>
      </div>

      <!-- District Hubs Section -->
      <div class="p-8 sm:p-12 rounded-3xl bg-surface border border-border shadow-soft space-y-6">
        <div>
          <h2 class="text-2xl font-extrabold text-text">District Hub Contacts</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (d of districts; track d.id) {
            <div class="p-5 rounded-2xl bg-background border border-border space-y-2">
              <h3 class="text-base font-bold text-primary">{{ d.name }} Hub</h3>
              <div class="text-xs text-text-muted space-y-1">
                <div>Covered Areas: <strong class="text-text">{{ d.areas.slice(0, 3).join(', ') }}</strong></div>
                <div>PIN: <span class="font-mono">{{ d.code }}</span></div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ContactComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  districts: District[] = [];

  ngOnInit(): void {
    this.titleService.setTitle('Contact Us | SteelGuard');
    this.metaService.updateTag({
      name: 'description',
      content: 'Get in touch with SteelGuard customer support and Kerala district installation hubs.'
    });

    const d = this.route.snapshot.data['districts'];
    if (d) {
      this.districts = d;
    }
  }
}
