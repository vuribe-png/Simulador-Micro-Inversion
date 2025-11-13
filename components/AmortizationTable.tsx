import React from 'react';
import type { ScheduleRow, ScheduleSummary } from '../types';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';

interface AmortizationTableProps {
  scheduleRows: ScheduleRow[];
  summary: ScheduleSummary;
}

const THEAD_CLASSES = "sticky top-0 bg-gray-100 text-gray-600 uppercase text-xs font-semibold z-10";
const TD_CLASSES = "px-1 py-1 border-b border-gray-200 text-[10px] text-gray-800";
const TH_CLASSES = `${TD_CLASSES} text-center align-middle`;
const HIDDEN_ON_MOBILE = "hidden md:table-cell";

const AmortizationTableComponent: React.FC<AmortizationTableProps> = ({ scheduleRows, summary }) => {
  const headers = [
    { label: 'Nro.<br/>Cuota', className: '' },
    { label: 'Fecha<br/>pago', className: '' },
    { label: 'Periodo', className: HIDDEN_ON_MOBILE },
    { label: 'Saldo<br/>capital', className: '' },
    { label: 'Amorti<br/>capital', className: '' },
    { label: 'Interés', className: '' },
    { label: 'Cuota<br/>parcial', className: HIDDEN_ON_MOBILE },
    { label: 'Gastos', className: HIDDEN_ON_MOBILE },
    { label: 'Cuota<br/>Total', className: HIDDEN_ON_MOBILE },
    { label: 'ITF', className: HIDDEN_ON_MOBILE },
    { label: 'Total<br/>a pagar', className: '' },
  ];

  return (
    <div className="overflow-x-auto max-h-[600px] border border-gray-200 rounded-lg shadow-sm" tabIndex={0}>
      <table className="w-full border-collapse" aria-labelledby="amortization-table-caption">
        <caption id="amortization-table-caption" className="sr-only">
            Cronograma de Pagos Simulado
        </caption>
        <thead>
          <tr className={THEAD_CLASSES}>
            {headers.map((header) => (
              <th scope="col" key={header.label} className={`${TH_CLASSES} ${header.className}`} dangerouslySetInnerHTML={{ __html: header.label }} />
            ))}
          </tr>
        </thead>
        <tbody>
          {scheduleRows.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className={`${TD_CLASSES} text-center font-medium`}>{row.cuotaNum}</td>
              <td className={`${TD_CLASSES} text-center`}>{row.fechaPago}</td>
              <td className={`${TD_CLASSES} text-center ${HIDDEN_ON_MOBILE}`}>{row.periodo}</td>
              <td className={`${TD_CLASSES} text-center`}>{formatCurrency(row.saldoCapital)}</td>
              <td className={`${TD_CLASSES} text-center`}>{row.cuotaNum === 'Desem' ? '' : formatCurrency(row.amortizacionCapital)}</td>
              <td className={`${TD_CLASSES} text-center`}>{row.cuotaNum === 'Desem' ? '' : formatCurrency(row.interesPeriodo)}</td>
              <td className={`${TD_CLASSES} text-center ${HIDDEN_ON_MOBILE}`}>{row.cuotaNum === 'Desem' ? '' : formatCurrency(row.cuotaParcial)}</td>
              <td className={`${TD_CLASSES} text-center ${HIDDEN_ON_MOBILE}`}>{row.cuotaNum === 'Desem' ? '' : formatNumber(row.gastos)}</td>
              <td className={`${TD_CLASSES} text-center ${HIDDEN_ON_MOBILE}`}>{row.cuotaNum === 'Desem' ? '' : formatCurrency(row.cuotaTotal)}</td>
              <td className={`${TD_CLASSES} text-center ${HIDDEN_ON_MOBILE}`}>{row.cuotaNum === 'Desem' ? '' : formatNumber(row.itf)}</td>
              <td className={`${TD_CLASSES} text-center font-semibold`}>{row.cuotaNum === 'Desem' ? '' : formatCurrency(row.totalAPagar)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-100 font-bold">
          {/* Desktop Footer */}
          <tr className="hidden md:table-row">
            <th scope="row" colSpan={4} className={`${TD_CLASSES} text-left`}>RESUMEN</th>
            <td className={`${TD_CLASSES} text-center`}>{formatCurrency(summary.totalAmortizacion)}</td>
            <td className={`${TD_CLASSES} text-center`}>{formatCurrency(summary.totalInteres)}</td>
            <td className={`${TD_CLASSES} text-center`}>{formatCurrency(summary.totalCuotaFija)}</td>
            <td className={`${TD_CLASSES} text-center`}>{formatNumber(summary.totalGastos)}</td>
            <td className={`${TD_CLASSES} text-center`}>{formatCurrency(summary.totalCuotaTotal)}</td>
            <td className={`${TD_CLASSES} text-center`}>{formatNumber(summary.totalITF)}</td>
            <td className={`${TD_CLASSES} text-center`}>{formatCurrency(summary.totalAPagar)}</td>
          </tr>
          <tr className="hidden md:table-row">
            <th scope="row" colSpan={3} className={`${TD_CLASSES} text-left`}>TEA</th>
            <td colSpan={4} className={`${TD_CLASSES} text-left`}>{formatPercent(summary.tea)}</td>
            <th scope="row" colSpan={2} className={`${TD_CLASSES} text-left`}>TCEA</th>
            <td colSpan={2} className={`${TD_CLASSES} text-left`}>{formatPercent(summary.tcea)}</td>
          </tr>

          {/* Mobile Footer */}
          <tr className="md:hidden">
            <th scope="row" colSpan={3} className={`${TD_CLASSES} text-left`}>RESUMEN</th>
            <td className={`${TD_CLASSES} text-center`}>{formatCurrency(summary.totalAmortizacion)}</td>
            <td className={`${TD_CLASSES} text-center`}>{formatCurrency(summary.totalInteres)}</td>
            <td className={`${TD_CLASSES} text-center`}>{formatCurrency(summary.totalAPagar)}</td>
          </tr>
          <tr className="md:hidden">
            <th scope="row" colSpan={2} className={`${TD_CLASSES} text-left`}>TEA</th>
            <td colSpan={2} className={`${TD_CLASSES} text-left`}>{formatPercent(summary.tea)}</td>
            <th scope="row" className={`${TD_CLASSES} text-left`}>TCEA</th>
            <td className={`${TD_CLASSES} text-left`}>{formatPercent(summary.tcea)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export const AmortizationTable = React.memo(AmortizationTableComponent);