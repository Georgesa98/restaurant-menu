'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Minus, Plus, X } from 'lucide-react';
import type { TenantData, WithTranslations } from '@/lib/types';

type SheetItem = WithTranslations<{
  id: string;
  name: string;
  description: string | null;
  price: { toString: () => string };
  imageCard: string | null;
  isAvailable: boolean;
  displayOrder: number;
}> & {
  categoryName: string;
};

function formatPrice(price: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    style: 'currency',
    currency: 'SYP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function tName(
  item: WithTranslations<{ name: string; description: string | null }>,
): string {
  return item.translations?.[0]?.name ?? item.name;
}

export function OrderSheet({
  isOpen,
  onClose,
  items,
  quantities,
  onUpdateQuantity,
  locale,
  t,
  tenant,
}: {
  isOpen: boolean;
  onClose: () => void;
  items: SheetItem[];
  quantities: Map<string, number>;
  onUpdateQuantity: (id: string, delta: number) => void;
  locale: string;
  t: ReturnType<typeof useTranslations>;
  tenant: TenantData;
}) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus the close button when opening
    closeRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const ordered = items
    .map((item) => ({ item, qty: quantities.get(item.id) ?? 0 }))
    .filter(({ qty }) => qty > 0)
    .sort((a, b) => a.item.categoryName.localeCompare(b.item.categoryName));

  const total = ordered.reduce((sum, { item, qty }) => sum + Number(item.price) * qty, 0);
  const totalItems = ordered.reduce((sum, { qty }) => sum + qty, 0);

  return (
    <div
      className={`order-sheet-container ${isOpen ? 'open' : ''}`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-label={t('yourOrder')}
    >
      <div className="order-sheet-backdrop" onClick={onClose} />
      <div ref={sheetRef} className="order-sheet">
        <div className="order-sheet-handle" />

        <div className="order-sheet-header">
          <div>
            <h2 className="order-sheet-title">{t('yourOrder')}</h2>
            <p className="order-sheet-subtitle">
              {totalItems} {t('itemCount', { count: totalItems })}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="order-sheet-close"
            aria-label={t('close')}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="order-sheet-body">
          {ordered.length === 0 ? (
            <div className="order-sheet-empty">
              <p>{t('emptyOrder')}</p>
            </div>
          ) : (
            <ul className="order-sheet-list">
              {ordered.map(({ item, qty }) => (
                <li key={item.id} className="order-sheet-row">
                  <div className="order-sheet-row-main">
                    <div className="order-sheet-info">
                      <p className="order-sheet-item-name">{tName(item)}</p>
                      <p className="order-sheet-item-category">{item.categoryName}</p>
                    </div>
                    <p className="order-sheet-line-total">
                      {formatPrice(Number(item.price) * qty, locale)}
                    </p>
                  </div>

                  <div className="order-sheet-stepper">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="order-sheet-stepper-btn"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} strokeWidth={2} />
                    </button>
                    <span className="order-sheet-stepper-count">{qty}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="order-sheet-stepper-btn"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} strokeWidth={2} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {ordered.length > 0 && (
          <div className="order-sheet-footer">
            <div className="order-sheet-total-row">
              <span className="order-sheet-total-label">{t('total')}</span>
              <span className="order-sheet-total-value">{formatPrice(total, locale)}</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .order-sheet-container {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          pointer-events: none;
        }

        .order-sheet-container.open {
          pointer-events: auto;
        }

        .order-sheet-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(46, 59, 66, 0.45);
          opacity: 0;
          transition: opacity 300ms ease;
        }

        .order-sheet-container.open .order-sheet-backdrop {
          opacity: 1;
        }

        .order-sheet {
          position: relative;
          width: 100%;
          max-width: 640px;
          max-height: 85vh;
          background: ${tenant.surfaceColor};
          border-radius: ${tenant.borderRadiusLg} ${tenant.borderRadiusLg} 0 0;
          border: 0.5px solid #E4DDCF;
          border-bottom: none;
          display: flex;
          flex-direction: column;
          transform: translateY(100%);
          transition: transform 350ms cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        .order-sheet-container.open .order-sheet {
          transform: translateY(0);
        }

        .order-sheet-handle {
          width: 36px;
          height: 4px;
          border-radius: 2px;
          background: #C9C0B2;
          margin: 10px auto 6px;
          flex-shrink: 0;
        }

        .order-sheet-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 16px 16px;
          border-bottom: 0.5px solid #E4DDCF;
          flex-shrink: 0;
        }

        .order-sheet-title {
          font-family: ${tenant.headingFont};
          font-size: 20px;
          font-weight: 500;
          font-style: italic;
          color: ${tenant.primaryColor};
          margin: 0;
        }

        .order-sheet-subtitle {
          font-family: ${tenant.bodyFont};
          font-size: 12px;
          color: ${tenant.textMuted};
          margin: 4px 0 0;
        }

        .order-sheet-close {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 0.5px solid #C9C0B2;
          background: transparent;
          color: ${tenant.primaryColor};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 120ms ease;
        }

        .order-sheet-close:focus-visible {
          outline: 2px solid ${tenant.primaryColor};
          outline-offset: 2px;
        }

        .order-sheet-body {
          flex: 1;
          overflow-y: auto;
          padding: 8px 16px;
        }

        .order-sheet-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 160px;
          text-align: center;
          color: ${tenant.textMuted};
          font-size: 14px;
        }

        .order-sheet-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .order-sheet-row {
          padding: 12px 0;
          border-bottom: 0.5px solid #E4DDCF;
        }

        .order-sheet-row:last-child {
          border-bottom: none;
        }

        .order-sheet-row-main {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }

        .order-sheet-info {
          min-width: 0;
        }

        .order-sheet-item-name {
          font-family: ${tenant.bodyFont};
          font-size: 14px;
          font-weight: 500;
          color: ${tenant.primaryColor};
          margin: 0;
          line-height: 1.3;
        }

        .order-sheet-item-category {
          font-family: ${tenant.bodyFont};
          font-size: 11px;
          color: ${tenant.textMuted};
          margin: 3px 0 0;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .order-sheet-line-total {
          font-family: ${tenant.bodyFont};
          font-size: 14px;
          font-weight: 500;
          color: #9C7638;
          white-space: nowrap;
          margin: 0;
        }

        .order-sheet-stepper {
          display: inline-flex;
          align-items: center;
          border: 0.5px solid #C9C0B2;
          border-radius: 999px;
          overflow: hidden;
          height: 28px;
          background: ${tenant.surfaceColor};
        }

        .order-sheet-stepper-btn {
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          color: ${tenant.primaryColor};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .order-sheet-stepper-btn:focus-visible {
          outline: 2px solid ${tenant.primaryColor};
          outline-offset: 2px;
        }

        .order-sheet-stepper-count {
          min-width: 2ch;
          text-align: center;
          font-size: 13px;
          font-weight: 500;
          color: ${tenant.primaryColor};
          padding: 0 6px;
        }

        .order-sheet-footer {
          padding: 14px 16px 18px;
          border-top: 0.5px solid #E4DDCF;
          background: ${tenant.surfaceColor};
          flex-shrink: 0;
        }

        .order-sheet-total-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .order-sheet-total-label {
          font-family: ${tenant.bodyFont};
          font-size: 14px;
          font-weight: 500;
          color: ${tenant.textMuted};
        }

        .order-sheet-total-value {
          font-family: ${tenant.bodyFont};
          font-size: 22px;
          font-weight: 500;
          color: ${tenant.accentColor};
        }

        @media (min-width: 640px) {
          .order-sheet {
            border-radius: ${tenant.borderRadiusLg};
            border-bottom: 0.5px solid #E4DDCF;
            margin-bottom: 24px;
            max-height: 80vh;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .order-sheet-backdrop,
          .order-sheet {
            transition: none;
          }
          .order-sheet-container:not(.open) .order-sheet {
            transform: translateY(100%);
          }
        }
      `}</style>
    </div>
  );
}
