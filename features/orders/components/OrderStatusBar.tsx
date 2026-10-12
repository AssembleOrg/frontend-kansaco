import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL, OrderStatus } from '@/types/order';

interface OrderStatusBarProps {
  status: OrderStatus;
  /** Si se pasa, cada etapa es clickeable (staff). Sin esto es solo lectura (cliente). */
  onChange?: (status: OrderStatus) => void;
  disabled?: boolean;
}

/** Barra de etapas del pedido (estilo statusbar de Odoo). CANCELADO queda fuera del flujo. */
export function OrderStatusBar({ status, onChange, disabled }: OrderStatusBarProps) {
  if (status === 'CANCELADO') {
    return (
      <div className="rounded-md bg-red-100 px-3 py-2 text-center text-sm font-semibold text-red-700">
        {ORDER_STATUS_LABEL.CANCELADO}
      </div>
    );
  }
  const current = ORDER_STATUS_FLOW.indexOf(status);
  return (
    <ol className="flex overflow-hidden rounded-md border border-gray-200 text-xs font-semibold sm:text-sm">
      {ORDER_STATUS_FLOW.map((s, i) => {
        const className = `w-full px-2 py-2 text-center ${
          i === current
            ? 'bg-green-600 text-white'
            : i < current
              ? 'bg-green-50 text-green-700'
              : 'bg-white text-gray-400'
        }`;
        return (
          <li
            key={s}
            aria-current={i === current ? 'step' : undefined}
            className="flex-1 border-l border-gray-200 first:border-l-0"
          >
            {onChange ? (
              <button
                type="button"
                disabled={disabled || i === current}
                onClick={() => onChange(s)}
                className={`${className} enabled:hover:bg-green-100 enabled:hover:text-green-800`}
              >
                {ORDER_STATUS_LABEL[s]}
              </button>
            ) : (
              <span className={`block ${className}`}>{ORDER_STATUS_LABEL[s]}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
