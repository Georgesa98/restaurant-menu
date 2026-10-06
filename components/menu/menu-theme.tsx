'use client';

import type { TenantData } from '@/lib/types';

/**
 * Per-tenant CSS vars + shared menu styles. Rendered by both the category
 * landing and the category detail page (mirrors the Flutter kiosk palette:
 * hairline #E4DDCF, image wash #EDE7DB, 16px cards).
 *
 * `scope` prefixes the custom-property block: the public pages keep the
 * default `:root`, while the admin themes preview passes `#theme-preview`
 * so the vars can never recolor the admin shell.
 */
export function MenuTheme({ tenant, scope = ':root' }: { tenant: TenantData; scope?: string }) {
  const compact = tenant.spacing === 'compact';
  return (
    <style>{`
      ${scope} {
        --primary: ${tenant.primaryColor};
        --secondary: ${tenant.secondaryColor};
        --accent: ${tenant.accentColor};
        --accent-text: #9C7638;
        --bg: ${tenant.backgroundColor};
        --surface: ${tenant.surfaceColor};
        --text: ${tenant.textColor};
        --text-muted: ${tenant.textMuted};
        --font-heading: ${tenant.headingFont};
        --font-body: ${tenant.bodyFont};
        --font-script: 'Alex Brush', cursive;
        --radius-sm: ${tenant.borderRadiusSm};
        --radius-md: ${tenant.borderRadiusMd};
        --radius-lg: ${tenant.borderRadiusLg};
        --shadow: ${tenant.shadow};
        --space: ${compact ? '9px' : '14px'};
        --space-categories: ${compact ? '9px' : '14px'};
        --space-section: ${compact ? '28px' : '48px'};
      }

      .menu-items-grid {
        gap: var(--space);
      }

      .menu-categories-container > * + * {
        margin-top: var(--space-section);
      }

      [data-card-style="elevated"] .menu-card {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14), 0 2px 6px rgba(0, 0, 0, 0.08);
      }

      /* Phone/tablet-portrait: horizontally scrollable tab strip. */
      .category-list {
        display: flex;
        flex-direction: row;
        gap: 8px;
        overflow-x: auto;
        scrollbar-width: none;
        padding-bottom: 4px;
      }

      .category-list::-webkit-scrollbar {
        display: none;
      }

      .category-list-item {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 44px;
        padding: 8px 12px;
        border-radius: var(--radius-md);
        border: 0.5px solid #E4DDCF;
        background: transparent;
        cursor: pointer;
        width: auto;
        flex-shrink: 0;
        white-space: nowrap;
        text-align: start;
        text-decoration: none;
        font-family: var(--font-body);
        font-size: 15px;
        color: var(--text);
        transition: background 120ms ease;
      }

      .category-list-item:hover {
        background: var(--surface);
      }

      .category-list-item:focus-visible {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
      }

      .category-list-item.active {
        background: var(--surface);
        border: 0.5px solid #E4DDCF;
        color: var(--primary);
        font-weight: 600;
      }

      .category-list-name {
        flex: 1;
        min-width: 0;
      }

      .category-list-count {
        font-size: 12px;
        color: var(--text-muted);
        white-space: nowrap;
      }

      .category-list-chevron {
        display: none;
        color: var(--text-muted);
        opacity: 0.6;
        flex-shrink: 0;
      }

      /* Detail page: the list is sidebar-only (≥900px), never stacked on top. */
      .category-list-sidebar {
        display: none;
      }

      .menu-browse-items > .menu-category + .menu-category {
        margin-top: var(--space-section);
      }

      @container (min-width: 900px) {
        .menu-browse {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }

        .menu-browse > .category-list,
        .menu-browse > .category-list-sidebar {
          width: 220px;
          flex-shrink: 0;
          position: sticky;
          top: 16px;
          border-inline-end: 0.5px solid #E4DDCF;
          padding-inline-end: 20px;
        }

        .menu-browse > .category-list-sidebar {
          display: block;
        }

        /* Sidebar mode: vertical list, no chip styling on inactive rows. */
        .menu-browse .category-list {
          flex-direction: column;
          overflow-x: visible;
          gap: 2px;
          padding-bottom: 0;
        }

        .menu-browse .category-list-item {
          width: 100%;
          border-color: transparent;
          background: transparent;
        }

        .menu-browse .category-list-item.active {
          background: var(--surface);
          border-color: #E4DDCF;
        }

        .menu-browse .category-list-chevron {
          display: inline-flex;
        }

        .menu-browse-items {
          flex: 1;
          min-width: 0;
        }

        .menu-browse-items .menu-items-grid {
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        }

        [data-menu-layout="single"] .menu-browse-items .menu-items-grid {
          grid-template-columns: 1fr;
        }
      }

      [data-menu-layout="single"] .menu-items-grid {
        grid-template-columns: 1fr;
      }

      [data-menu-layout="single"] .menu-items-grid > * {
        width: 100%;
        max-width: 480px;
        margin-inline: auto;
      }

      [data-menu-layout="single"] .menu-card {
        flex-direction: column;
        padding: 0;
        gap: 0;
      }

      [data-menu-layout="single"] .menu-card-image-wrap {
        width: auto;
        height: auto;
        flex-shrink: 0;
        border-radius: 0;
        aspect-ratio: 4 / 3;
      }

      [data-menu-layout="single"] .menu-card-body {
        padding: 12px 14px 14px;
        min-width: auto;
      }

      .menu-page {
        font-family: var(--font-body);
        background: var(--bg);
        color: var(--text);
        /* Layout breakpoints below are container queries so the admin
           themes preview (a 390px frame inside a desktop viewport)
           renders the same styles as a real phone. */
        container-type: inline-size;
      }

      .menu-card {
        background: var(--surface);
        border: 0.5px solid #E4DDCF;
        border-radius: var(--radius-lg);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .menu-card-image-wrap {
        aspect-ratio: 4 / 3;
        overflow: hidden;
      }

      .menu-card-image-wrap .placeholder-icon {
        color: var(--accent);
      }

      .menu-card-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 12px 14px 14px;
      }

      .menu-category {
        content-visibility: auto;
        contain-intrinsic-size: 400px;
      }

      .menu-section-header {
        font-family: var(--font-heading);
        font-size: 20px;
        font-weight: 500;
        font-style: italic;
        color: var(--primary);
        letter-spacing: -0.01em;
      }

      .menu-eyebrow {
        font-family: var(--font-body);
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 0.35em;
        text-transform: uppercase;
        color: var(--primary);
      }

      .menu-item-name {
        font-family: var(--font-body);
        font-size: 15px;
        font-weight: 500;
        color: var(--primary);
        line-height: 1.25;
      }

      .menu-item-description {
        font-family: var(--font-body);
        font-size: 12px;
        line-height: 1.45;
        color: var(--text-muted);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .menu-item-price {
        font-family: var(--font-body);
        font-size: 14px;
        font-weight: 500;
        color: var(--accent-text);
      }

      .menu-items-currency {
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.06em;
        color: var(--text-muted);
      }

      .item-line {
        padding: 12px 2px;
        border-bottom: 0.5px solid #E4DDCF;
      }

      .item-line .menu-item-name {
        color: var(--text);
        font-weight: 600;
        font-size: 17px;
      }

      .item-line-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .item-line-leader {
        flex: 1;
        min-width: 24px;
        border-bottom: 1px dotted var(--text-muted);
        align-self: center;
        transform: translateY(2px);
      }

      .item-line-add {
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        border: 1px solid var(--primary);
        background: transparent;
        color: var(--primary);
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: background 120ms ease;
      }

      .item-line-add:hover {
        background: var(--surface);
      }

      .item-line-add:focus-visible {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
      }

      /* 44px hit area even though the visible circle is 40px. */
      .item-line-add::before {
        content: '';
        position: absolute;
        inset: -2px;
      }

      .item-line .stepper-filled {
        background: var(--primary);
        border-color: var(--primary);
      }

      .item-line .stepper-filled .stepper-btn {
        color: var(--bg);
      }

      .item-line .stepper-filled .stepper-count {
        color: var(--bg);
      }

      .item-line-description {
        font-family: var(--font-body);
        font-size: 12px;
        line-height: 1.45;
        color: var(--text-muted);
        margin-top: 2px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .stepper {
        display: inline-flex;
        align-items: center;
        border: 0.5px solid #C9C0B2;
        border-radius: 999px;
        background: var(--surface);
        overflow: hidden;
        height: 36px;
      }

      .stepper-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border: none;
        background: transparent;
        color: var(--primary);
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: background 120ms ease;
      }

      .stepper-btn:focus-visible {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
        z-index: 1;
      }

      .stepper-btn.add {
        background: var(--primary);
        color: var(--bg);
        width: 56px;
        gap: 4px;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .stepper-count {
        min-width: 2ch;
        text-align: center;
        font-size: 13px;
        font-weight: 500;
        color: var(--primary);
        padding: 0 4px;
      }

      .ripple {
        position: absolute;
        width: 8px;
        height: 8px;
        background: var(--accent);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(1);
        animation: ripple-grow 500ms ease-out forwards;
        pointer-events: none;
        opacity: 0.6;
      }

      @keyframes ripple-grow {
        to {
          transform: translate(-50%, -50%) scale(12);
          opacity: 0;
        }
      }

      .menu-counter {
        position: sticky;
        bottom: 0;
        z-index: 30;
        background: var(--primary);
        color: #fff;
        cursor: pointer;
        border: none;
      }

      .menu-counter-label {
        color: #B7BEC2;
        font-size: 14px;
        font-weight: 500;
      }

      .menu-counter-sub {
        color: #8C959A;
        font-size: 11px;
      }

      .menu-counter-total {
        font-family: var(--font-body);
        font-size: 22px;
        font-weight: 500;
        color: var(--accent);
      }

      .placeholder-icon {
        color: var(--accent);
      }

      .variant-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .variant-chip {
        font-family: var(--font-body);
        font-size: 11px;
        font-weight: 500;
        padding: 4px 10px;
        border-radius: 999px;
        border: 0.5px solid #C9C0B2;
        background: transparent;
        color: var(--text-muted);
        cursor: pointer;
        transition: all 120ms ease;
      }

      .variant-chip:focus-visible {
        outline: 2px solid var(--primary);
        outline-offset: 1px;
      }

      .variant-chip.selected {
        background: var(--accent);
        border-color: var(--accent);
        color: #fff;
      }

      .variant-chip.has-qty {
        border-color: var(--accent);
        color: var(--accent);
      }

      .variant-chip.selected.has-qty {
        background: var(--accent);
        color: #fff;
      }

      @container (max-width: 479px) {
        .menu-card {
          flex-direction: row;
          padding: 10px;
          gap: 10px;
        }

        .menu-card-image-wrap {
          width: 72px;
          height: 72px;
          flex-shrink: 0;
          border-radius: 8px;
          aspect-ratio: auto;
        }

        .menu-card-image-wrap .placeholder-icon {
          font-size: 22px;
        }

        .menu-card-body {
          padding: 0;
          min-width: 0;
        }

        .menu-item-name {
          font-size: 16px;
        }

        .menu-item-price {
          font-size: 15px;
        }

        .menu-item-description {
          font-size: 13px;
        }

        .menu-categories-container > * + * {
          margin-top: ${compact ? '8px' : '10px'};
        }

        .menu-section-header {
          font-size: 18px;
        }

        .menu-category > div:first-child {
          margin-bottom: 2px;
          padding-bottom: 0;
        }

        .menu-items-grid {
          gap: ${compact ? '7px' : '10px'};
        }

        .variant-chips {
          gap: 4px;
        }

        .variant-chip {
          font-size: 11px;
          padding: 3px 8px;
        }

        .stepper {
          height: 28px;
        }

        .stepper-btn {
          width: 28px;
          height: 28px;
        }

        .stepper-btn.add {
          width: auto;
          font-size: 12px;
          gap: 2px;
          padding: 0 12px;
        }

        .stepper-count {
          font-size: 14px;
        }
      }

      @container (min-width: 480px) {
        .menu-item-name {
          font-size: 14px;
        }

        .stepper {
          height: 28px;
        }

        .stepper-btn {
          width: 28px;
          height: 28px;
        }

        .stepper-btn.add {
          width: 52px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .ripple {
          animation: none;
          opacity: 0;
        }
      }

    `}</style>
  );
}
