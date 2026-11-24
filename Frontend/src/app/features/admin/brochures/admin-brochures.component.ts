import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { BrochuresService, Brochure } from '../../../core/services/brochures.service';
import { ToastService } from '../../../shared/toast/toast.service';

@Component({
  selector: 'app-admin-brochures',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full flex-1 flex flex-col bg-gray-50/50 min-h-screen">
      
      <!-- Top Title & Subtitle Bar -->
      <div class="w-full px-7 sm:px-10 pt-6 pb-5 bg-white border-b border-gray-200">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-[20px] font-bold text-gray-900 tracking-tight">Brochure Documents</h1>
              <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-[#0f9d58] border border-emerald-200">
                {{ totalRecords() }} {{ totalRecords() === 1 ? 'Doc' : 'Docs' }}
              </span>
            </div>
            <p class="text-[13px] text-gray-500 mt-1">
              Upload PDF brochures, Word specs, and catalogue images to share directly with customers via WhatsApp or direct link.
            </p>
          </div>

          <!-- Quick Actions / Upload Toggle -->
          <button
            type="button"
            (click)="toggleUploadSection()"
            class="px-4 py-2 rounded-lg bg-[#0f9d58] hover:bg-[#0b8043] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            <span>{{ isUploadOpen() ? 'Hide Upload Form' : 'Upload New Brochure' }}</span>
          </button>
        </div>
      </div>

      <!-- Main Body Container -->
      <div class="w-full px-7 sm:px-10 py-6 max-w-7xl mx-auto space-y-6">

        <!-- Upload Card (Collapsible) -->
        @if (isUploadOpen()) {
          <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs animate-fadeIn">
            <div class="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <svg class="w-4 h-4 text-[#0f9d58]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Brochure Document
              </h2>
              <button
                type="button"
                (click)="isUploadOpen.set(false)"
                class="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                title="Close"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form (ngSubmit)="submitUpload()" class="mt-4 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Document Title -->
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">
                    Brochure Name / Title <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="newTitle"
                    name="title"
                    placeholder="e.g. Steel Doors Complete Catalogue 2026"
                    required
                    class="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0f9d58]/20 focus:border-[#0f9d58] transition-colors"
                  />
                </div>

                <!-- Document Description -->
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1.5">
                    Description / Customer Note (Optional)
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="newDescription"
                    name="description"
                    placeholder="e.g. Includes fire-rated models, warranty, and finish options"
                    class="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0f9d58]/20 focus:border-[#0f9d58] transition-colors"
                  />
                </div>
              </div>

              <!-- File Drag & Drop / Select Box -->
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1.5">
                  Document File (PDF, DOC, Images only) <span class="text-red-500">*</span>
                </label>
                
                <div
                  (dragover)="onDragOver($event)"
                  (dragleave)="onDragLeave($event)"
                  (drop)="onFileDrop($event)"
                  class="border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer"
                  [ngClass]="{
                    'border-[#0f9d58] bg-emerald-50/40': isDragging(),
                    'border-gray-200 hover:border-gray-300 bg-gray-50/50': !isDragging() && !selectedFile(),
                    'border-[#0f9d58]/40 bg-emerald-50/20': selectedFile()
                  }"
                  (click)="fileInput.click()"
                >
                  <input
                    #fileInput
                    type="file"
                    (change)="onFileSelected($event)"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp"
                    class="hidden"
                  />

                  @if (selectedFile()) {
                    <div class="flex items-center justify-center gap-3">
                      <!-- Badge based on file type -->
                      @let badge = getFileTypeBadge(selectedFile()?.name || '', selectedFile()?.type || '');
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border"
                        [ngClass]="[badge.bg, badge.text, badge.border]">
                        {{ badge.label }}
                      </div>
                      <div class="text-left">
                        <p class="text-xs font-bold text-gray-800">{{ selectedFile()?.name }}</p>
                        <p class="text-[11px] text-gray-500">{{ formatFileSize(selectedFile()?.size || 0) }}</p>
                      </div>
                      <button
                        type="button"
                        (click)="removeSelectedFile($event)"
                        class="ml-4 p-1.5 rounded-md hover:bg-gray-200 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  } @else {
                    <div class="space-y-1.5">
                      <svg class="w-8 h-8 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p class="text-xs font-medium text-gray-700">
                        <span class="text-[#0f9d58] font-bold">Click to browse</span> or drag and drop your file here
                      </p>
                      <p class="text-[11px] text-gray-400">PDF, Word (.doc, .docx), Images (.jpg, .png, .webp)</p>
                      <p class="text-[10px] text-red-500/80 font-medium">Videos (.mp4, .mov, etc.) and other files are not allowed</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Upload Submit Button -->
              <div class="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  (click)="resetForm()"
                  class="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="isUploading() || !newTitle.trim() || !selectedFile()"
                  class="px-5 py-2 rounded-lg bg-[#0f9d58] hover:bg-[#0b8043] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  @if (isUploading()) {
                    <svg class="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Uploading...</span>
                  } @else {
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Upload Document</span>
                  }
                </button>
              </div>
            </form>
          </div>
        }

        <!-- Filter & Search Bar -->
        <div class="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center shadow-2xs">
          <!-- Search input -->
          <div class="relative w-full sm:w-80">
            @if (isSearching()) {
              <svg class="w-4 h-4 text-[#0f9d58] animate-spin absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            } @else {
              <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()"
              (keyup.enter)="onSearchEnter()"
              placeholder="Search by brochure name or description..."
              class="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0f9d58]/20 focus:border-[#0f9d58] transition-colors"
            />
            @if (searchQuery) {
              <button
                type="button"
                (click)="clearSearch()"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            }
          </div>
        </div>

        <!-- Documents List -->
        @if (isLoading() && !isSearching()) {
          <div class="py-16 text-center bg-white rounded-2xl border border-gray-200">
            <svg class="animate-spin w-8 h-8 text-[#0f9d58] mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <p class="text-xs text-gray-500 font-medium">Loading brochure documents...</p>
          </div>
        } @else if (filteredBrochures().length === 0) {
          <!-- Empty State -->
          <div class="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300 p-8 space-y-3">
            <div class="w-14 h-14 rounded-full bg-emerald-50 text-[#0f9d58] mx-auto flex items-center justify-center">
              <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900">No brochure documents found</h3>
              <p class="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                @if (searchQuery.trim()) {
                  No brochures match your search query "{{ searchQuery.trim() }}". Try clearing the filter.
                } @else {
                  Get started by uploading your first brochure document or product catalogue.
                }
              </p>
            </div>
            @if (searchQuery.trim()) {
              <button
                type="button"
                (click)="clearSearch()"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                Clear Search
              </button>
            } @else if (!isUploadOpen()) {
              <button
                type="button"
                (click)="isUploadOpen.set(true)"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0f9d58] hover:bg-[#0b8043] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
                </svg>
                <span>Upload First Brochure</span>
              </button>
            }
          </div>
        } @else {
          <!-- Document Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (item of filteredBrochures(); track item.id) {
              @let itemBadge = getFileTypeBadge(item.file_name || item.original_name, item.mime_type || '');
              <div 
                class="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                [class.card-deleting]="isCardDeleting(item.id)"
              >
                
                <div>
                  <!-- Card Header: Dynamic Badge & Date -->
                  <div class="flex items-start justify-between gap-3 mb-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border"
                      [ngClass]="[itemBadge.bg, itemBadge.text, itemBadge.border]">
                      {{ itemBadge.label }}
                    </div>
                    <div class="text-right">
                      <span class="text-[11px] font-semibold text-gray-400 block">
                        {{ item.created_at | date:'dd MMM yyyy' }}
                      </span>
                      @if (item.file_size) {
                        <span class="text-[10px] text-gray-500 font-medium">
                          {{ formatFileSize(item.file_size) }}
                        </span>
                      }
                    </div>
                  </div>

                  <!-- Title -->
                  <h3 class="text-sm font-bold text-gray-900 group-hover:text-[#0f9d58] transition-colors line-clamp-2">
                    {{ item.title }}
                  </h3>

                  <!-- Description -->
                  <p class="text-xs text-gray-500 mt-1.5 line-clamp-3 leading-relaxed">
                    {{ item.description || 'No description provided.' }}
                  </p>

                  <!-- Original File Info -->
                  <div class="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-[11px] text-gray-400 truncate">
                    <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span class="truncate">{{ item.original_name }}</span>
                  </div>
                </div>

                <!-- Action Buttons Footer -->
                <div class="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5">
                    <!-- View / Open in new tab -->
                    <button
                      type="button"
                      (click)="viewDocument(item)"
                      class="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#0f9d58] hover:text-[#0f9d58] hover:bg-emerald-50/30 text-gray-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Open document in new tab"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>View</span>
                    </button>

                    <!-- Copy Share Link -->
                    <button
                      type="button"
                      (click)="copyShareLink(item)"
                      class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                      [ngClass]="copiedId() === item.id 
                        ? 'bg-emerald-50 text-[#0f9d58] border border-emerald-300' 
                        : 'border border-gray-200 hover:border-[#0f9d58] hover:text-[#0f9d58] hover:bg-emerald-50/30 text-gray-700'"
                      [title]="'Shareable URL: ' + getShareUrl(item)"
                    >
                      @if (copiedId() === item.id) {
                        <svg class="w-3.5 h-3.5 text-[#0f9d58]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span class="text-[#0f9d58]">Copied!</span>
                      } @else {
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        <span>Share</span>
                      }
                    </button>
                  </div>

                  <!-- Delete Button (Prompt confirmation before deleting) -->
                  <button
                    type="button"
                    (click)="promptDeleteBrochure(item, $event)"
                    class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete brochure"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

              </div>
            }
          </div>
        }

        <!-- Pagination Controls -->
        @if (!isLoading() && totalRecords() > 0) {
          <div class="bg-white rounded-xl border border-gray-200 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 shadow-2xs select-none">
            <div>
              Showing <strong class="text-gray-900 font-bold">{{ getStartIndex() }} to {{ getEndIndex() }}</strong> of
              <strong class="text-gray-900 font-bold">{{ totalRecords() }}</strong> {{ totalRecords() === 1 ? 'document' : 'documents' }}
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="prevPage()"
                [disabled]="currentPage() === 1 || isLoading()"
                class="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                <span>Previous</span>
              </button>

              <span class="text-gray-900 font-bold px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs">
                Page {{ currentPage() }} of {{ totalPages() || 1 }}
              </span>

              <button
                type="button"
                (click)="nextPage()"
                [disabled]="currentPage() >= totalPages() || isLoading()"
                class="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span>Next</span>
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        }

        <!-- Delete Confirmation Alert Modal -->
        @if (deleteModalOpen() && brochureToDelete()) {
          <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <!-- Backdrop -->
            <div
              class="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
              (click)="cancelDelete()"
            ></div>

            <!-- Dialog Box -->
            <div
              role="dialog"
              aria-modal="true"
              class="relative w-full max-w-sm bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 sm:p-7 flex flex-col items-center text-center animate-scaleUp z-10"
              (click)="$event.stopPropagation()"
            >
              <!-- Close button in top-right -->
              <button
                type="button"
                (click)="cancelDelete()"
                class="absolute top-4 right-4 w-8 h-8 rounded-full border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <!-- Status Icon -->
              <div class="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mb-4 shadow-2xs">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <!-- Title & Message -->
              <h3 class="text-lg font-bold text-gray-900 mb-1">Delete Brochure</h3>
              <p class="text-sm text-gray-500 leading-relaxed mb-6">
                Are you sure you want to delete <strong class="text-gray-800">"{{ brochureToDelete()?.title }}"</strong>? This action cannot be undone.
              </p>

              <!-- Action Buttons: OK and Cancel -->
              <div class="grid grid-cols-2 gap-3 w-full">
                <button
                  type="button"
                  (click)="confirmDelete()"
                  [disabled]="isDeleting()"
                  class="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white shadow-soft transition-all cursor-pointer flex items-center justify-center gap-2 focus:ring-4 focus:ring-red-200 disabled:opacity-50"
                >
                  @if (isDeleting()) {
                    <span class="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Deleting...</span>
                  } @else {
                    <span>OK</span>
                  }
                </button>

                <button
                  type="button"
                  (click)="cancelDelete()"
                  [disabled]="isDeleting()"
                  class="w-full py-2.5 px-4 rounded-xl font-bold text-sm border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-all cursor-pointer flex items-center justify-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class AdminBrochuresComponent implements OnInit, OnDestroy {
  private brochuresService = inject(BrochuresService);
  private toast = inject(ToastService);
  private titleService = inject(Title);

  // Allowed extensions strictly limited to PDF, DOC, and Images
  private readonly allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp'];
  private readonly maxFileSizeBytes = 10 * 1024 * 1024; // 10MB limit

  brochures = signal<Brochure[]>([]);
  totalRecords = signal<number>(0);
  currentPage = signal<number>(1);
  pageSize = 9;
  totalPages = signal<number>(1);
  isLoading = signal<boolean>(false);
  isSearching = signal<boolean>(false);
  isUploadOpen = signal<boolean>(false);
  isUploading = signal<boolean>(false);
  isDragging = signal<boolean>(false);
  copiedId = signal<number | null>(null);
  deletingIds = signal<Set<number>>(new Set<number>());

  // Delete Confirmation Alert Modal State
  deleteModalOpen = signal<boolean>(false);
  brochureToDelete = signal<Brochure | null>(null);
  isDeleting = signal<boolean>(false);

  isCardDeleting(id: number): boolean {
    return this.deletingIds().has(id);
  }

  searchQuery = '';
  private searchDebounceTimer: any;
  private searchSub?: Subscription;

  // Form fields
  newTitle = '';
  newDescription = '';
  selectedFile = signal<File | null>(null);

  filteredBrochures = computed(() => this.brochures());

  ngOnInit(): void {
    this.titleService.setTitle('Brochure Documents - Admin');
    this.loadBrochures();
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchDebounceTimer);
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }

  toggleUploadSection(): void {
    this.isUploadOpen.set(!this.isUploadOpen());
  }

  loadBrochures(isDebounceSearch = false): void {
    if (isDebounceSearch) {
      this.isSearching.set(true);
    } else {
      this.isLoading.set(true);
    }

    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }

    const query = this.searchQuery.trim();
    this.searchSub = this.brochuresService.getBrochures(query, this.currentPage(), this.pageSize).subscribe({
      next: (res) => {
        this.brochures.set(res.data);
        if (res.pagination) {
          this.totalRecords.set(res.pagination.total);
          this.totalPages.set(res.pagination.totalPages);
          if (this.currentPage() > res.pagination.totalPages && res.pagination.totalPages > 0) {
            this.currentPage.set(res.pagination.totalPages);
            this.loadBrochures();
            return;
          }
        } else {
          this.totalRecords.set(res.data.length);
          this.totalPages.set(1);
        }
        this.isLoading.set(false);
        this.isSearching.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.isSearching.set(false);
        this.toast.error('Failed to load brochures. ' + (err.error?.error || err.message));
      }
    });
  }

  getStartIndex(): number {
    if (this.totalRecords() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage() * this.pageSize, this.totalRecords());
  }

  prevPage(): void {
    if (this.currentPage() > 1 && !this.isLoading()) {
      this.currentPage.update(p => p - 1);
      this.loadBrochures();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() && !this.isLoading()) {
      this.currentPage.update(p => p + 1);
      this.loadBrochures();
    }
  }

  onSearchChange(): void {
    clearTimeout(this.searchDebounceTimer);
    this.isSearching.set(true);
    this.searchDebounceTimer = setTimeout(() => {
      this.currentPage.set(1);
      this.loadBrochures(true);
    }, 300);
  }

  onSearchEnter(): void {
    clearTimeout(this.searchDebounceTimer);
    this.currentPage.set(1);
    this.loadBrochures(false);
  }

  clearSearch(): void {
    clearTimeout(this.searchDebounceTimer);
    this.searchQuery = '';
    this.currentPage.set(1);
    this.loadBrochures(false);
  }

  /**
   * Strictly validate that file is within 10MB limit and is PDF, DOC/DOCX, or Image. Explicitly block video files.
   */
  private validateFile(file: File): boolean {
    // 1. Check file size limit (10MB)
    if (file.size > this.maxFileSizeBytes) {
      this.toast.warning(`File size exceeds 10MB limit (${this.formatFileSize(file.size)}). Please choose a file up to 10MB.`);
      return false;
    }

    const name = (file.name || '').toLowerCase();
    const type = (file.type || '').toLowerCase();

    // 2. Explicitly check for and reject video files
    if (
      type.startsWith('video/') ||
      /\.(mp4|mov|avi|mkv|webm|flv|wmv|3gp|m4v)$/i.test(name)
    ) {
      this.toast.error('Video files are not allowed. Only PDF, Word documents (.doc, .docx), and images are permitted.');
      return false;
    }

    // 3. Reject audio, archives, and executables
    if (
      type.startsWith('audio/') ||
      /\.(zip|rar|7z|tar|gz|exe|bat|sh|apk|bin|iso)$/i.test(name)
    ) {
      this.toast.error('Unsupported file format. Only PDF, Word documents, and images are allowed.');
      return false;
    }

    // 4. Verify extension
    const hasValidExt = this.allowedExtensions.some(ext => name.endsWith(ext));
    if (!hasValidExt) {
      this.toast.error('Only PDF, DOC, DOCX, and images (JPG, PNG, WEBP) are allowed.');
      return false;
    }

    return true;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!this.validateFile(file)) {
        input.value = '';
        this.selectedFile.set(null);
        return;
      }
      this.selectedFile.set(file);
      if (!this.newTitle.trim()) {
        const rawName = file.name.replace(/\.[^/.]+$/, '');
        this.newTitle = rawName;
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (!this.validateFile(file)) {
        this.selectedFile.set(null);
        return;
      }
      this.selectedFile.set(file);
      if (!this.newTitle.trim()) {
        const rawName = file.name.replace(/\.[^/.]+$/, '');
        this.newTitle = rawName;
      }
    }
  }

  removeSelectedFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile.set(null);
  }

  resetForm(): void {
    this.newTitle = '';
    this.newDescription = '';
    this.selectedFile.set(null);
    this.isUploadOpen.set(false);
  }

  submitUpload(): void {
    const file = this.selectedFile();
    const title = this.newTitle.trim();

    if (!title) {
      this.toast.error('Please enter a brochure title.');
      return;
    }

    // Instant client-side check if a brochure with the same name is already loaded
    const existing = this.brochures().find(b => b.title.trim().toLowerCase() === title.toLowerCase());
    if (existing) {
      this.toast.warning(`A brochure with the name "${title}" already exists. Please choose a unique name.`);
      return;
    }

    if (!file) {
      this.toast.error('Please select a document file to upload.');
      return;
    }

    if (!this.validateFile(file)) {
      return;
    }

    this.isUploading.set(true);
    this.brochuresService.uploadBrochure(title, this.newDescription.trim(), file).subscribe({
      next: (created) => {
        this.isUploading.set(false);
        this.toast.success(`Brochure "${title}" uploaded successfully!`);
        this.resetForm();
        this.searchQuery = '';
        this.currentPage.set(1);
        this.loadBrochures();
      },
      error: (err) => {
        this.isUploading.set(false);
        this.toast.error(err.error?.error || 'Failed to upload brochure document.');
      }
    });
  }

  getShareUrl(item: Brochure): string {
    return this.brochuresService.getShareUrl(item);
  }

  viewDocument(item: Brochure): void {
    const url = this.brochuresService.getViewUrl(item);
    window.open(url, '_blank');
  }

  copyShareLink(item: Brochure): void {
    const url = this.brochuresService.getShareUrl(item);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        this.copiedId.set(item.id);
        this.toast.success('Share link copied to clipboard!');
        setTimeout(() => {
          if (this.copiedId() === item.id) {
            this.copiedId.set(null);
          }
        }, 2500);
      }).catch(() => {
        this.fallbackCopy(url, item.id);
      });
    } else {
      this.fallbackCopy(url, item.id);
    }
  }

  private fallbackCopy(text: string, id: number): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      this.copiedId.set(id);
      this.toast.success('Share link copied to clipboard!');
      setTimeout(() => {
        if (this.copiedId() === id) {
          this.copiedId.set(null);
        }
      }, 2500);
    } catch {
      this.toast.error('Could not copy automatically. URL: ' + text);
    }
    document.body.removeChild(textarea);
  }

  promptDeleteBrochure(item: Brochure, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.brochureToDelete.set(item);
    this.deleteModalOpen.set(true);
  }

  cancelDelete(): void {
    this.deleteModalOpen.set(false);
    this.brochureToDelete.set(null);
  }

  confirmDelete(): void {
    const item = this.brochureToDelete();
    if (!item) return;

    this.isDeleting.set(true);
    const targetId = item.id;

    this.brochuresService.deleteBrochure(targetId).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleteModalOpen.set(false);
        this.brochureToDelete.set(null);

        this.brochures.update(list => list.filter(b => b.id !== targetId));
        this.totalRecords.update(n => Math.max(0, n - 1));
        this.toast.success(`Brochure "${item.title}" deleted.`);

        if (this.brochures().length === 0 && this.currentPage() > 1) {
          this.currentPage.update(p => p - 1);
        }
        this.loadBrochures(true);
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.toast.error('Failed to delete brochure: ' + (err.error?.error || err.message));
      }
    });
  }

  deleteBrochure(item: Brochure, event?: Event): void {
    this.promptDeleteBrochure(item, event);
  }

  formatFileSize(bytes?: number): string {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  getFileTypeBadge(filename = '', mimetype = ''): { label: string; bg: string; text: string; border: string } {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf' || mimetype === 'application/pdf') {
      return { label: 'PDF', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' };
    }
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext) || mimetype.startsWith('image/')) {
      return { label: 'IMG', bg: 'bg-emerald-50', text: 'text-[#0f9d58]', border: 'border-emerald-200' };
    }
    if (['doc', 'docx'].includes(ext) || mimetype.includes('word') || mimetype.includes('officedocument')) {
      return { label: 'DOC', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
    }
    return { label: 'DOC', bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
  }
}
