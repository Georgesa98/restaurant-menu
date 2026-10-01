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

      .category-grid {
        gap: var(--space-categories);
      }

      .menu-categories-container > * + * {
        margin-top: var(--space-section);
      }

      [data-card-style="elevated"] .menu-card,
      [data-card-style="elevated"] .category-card {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14), 0 2px 6px rgba(0, 0, 0, 0.08);
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

      .category-card {
        background: var(--surface);
        border: 0.5px solid #E4DDCF;
        border-radius: var(--radius-lg);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        min-height: 184px;
        transition: transform 120ms ease, box-shadow 120ms ease;
      }

      .category-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow);
      }

      .category-card:focus-visible {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
      }

      .category-card-cover {
        height: 112px;
        flex-shrink: 0;
        overflow: hidden;
        background: #EDE7DB;
      }

      .category-card-name {
        font-family: var(--font-body);
        font-size: 15px;
        font-weight: 500;
        line-height: 1.25;
        color: var(--primary);
      }

      .category-card-count {
        font-family: var(--font-body);
        font-size: 12px;
        color: var(--text-muted);
      }

      .category-card-chevron {
        color: var(--text-muted);
        opacity: 0.6;
        flex-shrink: 0;
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
