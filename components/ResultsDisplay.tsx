import React, { useEffect, useMemo, useRef } from 'react';
// FIX: Removed ChartTypeRegistry as it's not used after removing the failing module augmentation.
import type { Chart, ChartConfiguration, ChartData as ChartJSData } from 'chart.js';
import type { CalculationResult } from '../types.ts';
import { AmortizationTable } from './AmortizationTable.tsx';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters.ts';

// FIX: Removed the 'chart.js' module augmentation. It was causing a "module not found" error
// because Chart.js is loaded from a CDN and type definitions are not resolved as a local module.
// Subsequent errors about the 'datalabels' property are fixed by casting plugin options to 'any'.

// Because ChartJS is loaded from CDN, we need to assert its type.
declare const ChartDataLabels: any;

interface ResultsDisplayProps {
  results: CalculationResult;
  isTableVisible: boolean;
  onToggleTable: () => void;
}

interface ChartComponentProps {
  config: ChartConfiguration;
  ariaLabel: string;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ config, ariaLabel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if ((window as any).Chart) {
      (window as any).Chart.register(ChartDataLabels);
    }
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = new (window as any).Chart(canvasRef.current, config);
    }

    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, [config]);

  return <canvas ref={canvasRef} role="img" aria-label={ariaLabel}></canvas>;
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isTableVisible, onToggleTable }) => {
  const { charts, scheduleRows, summary } = results;

  const rentabilidadChartConfig: ChartConfiguration = useMemo(() => ({
    type: 'bar',
    data: {
      labels: ['Rentab. Anual', 'Interés DPF'],
      datasets: [{
        label: 'Porcentaje (%)',
        data: [charts.rentabilidad.prestamo * 100, charts.rentabilidad.dpf * 100],
        backgroundColor: ['#00B050', '#f9ba48'],
        borderColor: ['#009a44', '#e4a83a'],
        borderWidth: 1,
        borderRadius: { topLeft: 15, topRight: 15 },
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: { 
        y: { 
          beginAtZero: true, 
          title: { display: true, text: 'Porcentaje (%)', color: '#000', font: { size: 10 } }, 
          ticks: { callback: (v) => `${Number(v).toFixed(2)}%`, color: '#000', font: { size: 10 } },
          grid: { color: '#e0e0e0', drawBorder: false }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#000', font: { size: 10 } }
        }
      },
      plugins: { 
        legend: { display: false }, 
        tooltip: { 
          backgroundColor: '#fff', titleColor: '#333', bodyColor: '#666',
          borderColor: '#ddd', borderWidth: 1, padding: 10, displayColors: true,
          callbacks: { label: c => `${c.dataset.label || ''}: ${Number(c.parsed.y).toFixed(2)}%` } 
        }, 
        datalabels: { 
          color: '#fff', 
          formatter: (v) => `${Number(v).toFixed(2)}%`, 
          anchor: 'center', align: 'center', 
          font: { size: 10, weight: 'bold' } 
        } 
      } as any
    },
    plugins: [ChartDataLabels],
  }), [charts.rentabilidad]);

  const gananciaChartConfig: ChartConfiguration = useMemo(() => ({
    type: 'bar',
    data: {
      labels: ['Ganancia', 'Interés'],
      datasets: [{
        label: 'Monto (S/)',
        data: [charts.ganancia.prestamo, charts.ganancia.dpf],
        backgroundColor: ['#00B050', '#f9ba48'],
        borderColor: ['#009a44', '#e4a83a'],
        borderWidth: 1,
        borderRadius: { topLeft: 15, topRight: 15 },
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: { 
        y: { 
          beginAtZero: true, 
          title: { display: true, text: 'Monto (S/)', color: '#000', font: { size: 10 } }, 
          ticks: { callback: v => `S/ ${Number(v).toLocaleString('es-PE', { maximumFractionDigits: 0 })}`, color: '#000', font: { size: 10 } },
          grid: { color: '#e0e0e0', drawBorder: false }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#000', font: { size: 10 } }
        }
      },
      plugins: { 
        legend: { display: false }, 
        tooltip: { 
          backgroundColor: '#fff', titleColor: '#333', bodyColor: '#666',
          borderColor: '#ddd', borderWidth: 1, padding: 10, displayColors: true,
          callbacks: { label: c => `${c.dataset.label || ''}: S/ ${Number(c.parsed.y).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` } 
        }, 
        datalabels: { 
          color: '#fff', 
          formatter: (v) => v === 0 ? '' : `S/ ${Number(v).toFixed(0)}`, 
          anchor: 'center', align: 'center', 
          font: { size: 10, weight: 'bold' } 
        } 
      } as any
    },
    plugins: [ChartDataLabels],
  }), [charts.ganancia]);

  const totalRetornoChartConfig: ChartConfiguration = useMemo(() => ({
    type: 'bar',
    data: {
      labels: ['Inver+Ganan', 'Ahorro+Int'],
      datasets: [
        { 
          label: 'Capital', 
          data: [charts.retorno.capitalInversion, charts.retorno.capitalAhorro], 
          backgroundColor: '#022140', 
          borderColor: '#022140', 
          stack: 'totalRetorno' 
        },
        { 
          label: 'Ganancia', 
          data: [charts.retorno.gananciaPyme, 0], 
          backgroundColor: '#00B050', 
          borderColor: '#009a44', 
          stack: 'totalRetorno',
          borderRadius: { topLeft: 15, topRight: 15 },
        },
        { 
          label: 'Interés', 
          data: [0, charts.retorno.interesDPF], 
          backgroundColor: '#f9ba48', 
          borderColor: '#e4a83a', 
          stack: 'totalRetorno',
          borderRadius: { topLeft: 15, topRight: 15 },
        },
        {
          label: 'TotalLabel',
          data: [0, 0],
          stack: 'totalRetorno',
          datalabels: {
            display: true,
            color: '#333',
            anchor: 'end',
            align: 'end',
            offset: -5,
            font: { size: 10, weight: 'bold' },
            formatter: (value, context) => {
              const dataIndex = context.dataIndex;
              const datasets = context.chart.data.datasets;
              let total = 0;
              for (let i = 0; i < datasets.length; i++) {
                if (datasets[i].label !== 'TotalLabel' && context.chart.isDatasetVisible(i)) {
                    total += Number(datasets[i].data[dataIndex]);
                }
              }
              return `S/ ${total.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`;
            },
          }
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: { 
        x: { 
            stacked: true, 
            grid: { display: false }, 
            ticks: { color: '#000', font: { size: 10 } } 
        }, 
        y: { 
          stacked: true, beginAtZero: true, 
          title: { display: true, text: 'Monto (S/)', color: '#000', font: { size: 10 } }, 
          ticks: { callback: v => `S/ ${Number(v).toLocaleString('es-PE', { maximumFractionDigits: 0 })}`, color: '#000', font: { size: 10 } },
          grid: { color: '#e0e0e0', drawBorder: false }
        } 
      },
      plugins: {
        datalabels: { 
          display: (context) => context.dataset.label !== 'TotalLabel',
          color: '#fff', 
          formatter: (v) => v === 0 ? '' : `S/ ${Number(v).toFixed(0)}`, 
          anchor: 'center', align: 'center', 
          font: { size: 10, weight: 'bold' } 
        },
        legend: { 
          position: 'top', 
          labels: { 
            usePointStyle: true, pointStyle: 'circle', 
            boxWidth: 5,
            boxHeight: 5,
            padding: 5, color: '#000', 
            font: { size: 10 },
            filter: (item) => item.text !== 'TotalLabel',
          } 
        },
        tooltip: { 
          backgroundColor: '#fff', titleColor: '#333', bodyColor: '#666',
          borderColor: '#ddd', borderWidth: 1, padding: 10,
          mode: 'index', intersect: false, 
          usePointStyle: true,
          filter: (item) => item.dataset.label !== 'TotalLabel',
          callbacks: { 
            label: (c) => {
              if (c.raw === 0) return null;
              return `${c.dataset.label || ''}: S/ ${Number(c.parsed.y).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            },
            afterBody: (items) => {
              const total = items.reduce((sum, item) => sum + item.parsed.y, 0);
              return `\nTotal: S/ ${total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
          } 
        }
      } as any
    },
    plugins: [ChartDataLabels],
  }), [charts.retorno]);
  
  const handleExportPDF = () => {
    if (!(window as any).jspdf || !(window as any).jspdf.jsPDF) {
      console.error("jsPDF is not loaded!");
      alert("Error: La biblioteca para exportar a PDF no se pudo cargar.");
      return;
    }
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();

    const tableHeaders = [
        'Nro. Cuota', 'Fecha pago', 'Periodo', 'Saldo capital', 'Amorti capital', 'Interés',
        'Cuota parcial', 'Gastos', 'Cuota Total', 'ITF', 'Total a pagar'
    ];

    const tableBody = scheduleRows.map(row => {
      if (row.cuotaNum === 'Desem') {
        return [
          row.cuotaNum, row.fechaPago, row.periodo.toString(), formatCurrency(row.saldoCapital),
          '', '', '', '', '', '', ''
        ];
      }
      return [
        row.cuotaNum.toString(), row.fechaPago, row.periodo.toString(), formatCurrency(row.saldoCapital),
        formatCurrency(row.amortizacionCapital), formatCurrency(row.interesPeriodo),
        formatCurrency(row.cuotaParcial), formatNumber(row.gastos),
        formatCurrency(row.cuotaTotal), formatNumber(row.itf), formatCurrency(row.totalAPagar)
      ];
    });

    const tableFoot = [
        [
            { content: 'RESUMEN', colSpan: 4, styles: { fontStyle: 'bold' } },
            { content: formatCurrency(summary.totalAmortizacion), styles: { halign: 'right' } },
            { content: formatCurrency(summary.totalInteres), styles: { halign: 'right' } },
            { content: formatCurrency(summary.totalCuotaFija), styles: { halign: 'right' } },
            { content: formatNumber(summary.totalGastos), styles: { halign: 'right' } },
            { content: formatCurrency(summary.totalCuotaTotal), styles: { halign: 'right' } },
            { content: formatNumber(summary.totalITF), styles: { halign: 'right' } },
            { content: formatCurrency(summary.totalAPagar), styles: { halign: 'right' } }
        ],
        [
            { content: 'TEA', colSpan: 3, styles: { fontStyle: 'bold' } },
            { content: formatPercent(summary.tea), colSpan: 4 },
            { content: 'TCEA', colSpan: 2, styles: { fontStyle: 'bold' } },
            { content: formatPercent(summary.tcea), colSpan: 2 }
        ]
    ];

    const title = 'Cronograma de Pagos Simulado';
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(14);
    const textWidth = doc.getStringUnitWidth(title) * doc.getFontSize() / doc.internal.scaleFactor;
    const textX = (pageWidth - textWidth) / 2;
    doc.text(title, textX, 15);

    (doc as any).autoTable({
        startY: 20,
        head: [tableHeaders],
        body: tableBody,
        foot: tableFoot,
        theme: 'striped',
        headStyles: { fillColor: [0, 176, 80] },
        footStyles: { fillColor: [241, 243, 244], textColor: [50, 50, 50] },
        didParseCell: (data: any) => {
            if (data.section === 'foot' && data.row.index === 0) {
                data.cell.styles.fillColor = [0, 176, 80];
                data.cell.styles.textColor = [255, 255, 255];
                data.cell.styles.fontStyle = 'bold';
            }
        },
        styles: { fontSize: 7, cellPadding: 1.5 },
        columnStyles: {
            0: { halign: 'center' }, 2: { halign: 'center' },
            3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' },
            6: { halign: 'right' }, 7: { halign: 'right' }, 8: { halign: 'right' },
            9: { halign: 'right' }, 10: { halign: 'right' }
        },
        didDrawPage: (data: any) => {
            const pageHeight = doc.internal.pageSize.getHeight();
            const pageWidth = doc.internal.pageSize.getWidth();
            const footerText = "© 2025 Simulador de Micro Inversión. Todos los derechos reservados.";
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            const textWidth = doc.getStringUnitWidth(footerText) * doc.getFontSize() / doc.internal.scaleFactor;
            const textX = (pageWidth - textWidth) / 2;
            doc.text(footerText, textX, pageHeight - 10);
        },
    });

    const disclaimer = "Tasa Máxima de Interés Compensatorio para Operaciones entre Personas: 113.16% Anual. Según BCRP";
    const finalY = (doc as any).lastAutoTable.finalY;
    if (finalY) {
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(disclaimer, 14, finalY + 8);
        
        const now = new Date();
        const generationTime = `Generado el: ${now.toLocaleDateString('es-PE')} a las ${now.toLocaleTimeString('es-PE')}`;
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(generationTime, 14, finalY + 12);
    }

    doc.save('cronograma-de-pagos.pdf');
  };

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 rounded-lg bg-[#00B050]/10 border-t border-gray-200">
        <div className="bg-white p-5 rounded-lg shadow-sm h-80">
          <h3 className="text-center text-lg font-semibold text-gray-700 mb-4">Rentabilidad vs Interés DPF</h3>
          <ChartComponent config={rentabilidadChartConfig} ariaLabel="Gráfico de barras comparando la rentabilidad anual del préstamo con el interés de un depósito a plazo fijo." />
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm h-80">
          <h3 className="text-center text-lg font-semibold text-gray-700 mb-4">Ganancia vs Interés</h3>
          <ChartComponent config={gananciaChartConfig} ariaLabel="Gráfico de barras comparando la ganancia total del préstamo con el interés de un depósito a plazo fijo." />
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm h-80">
            <h3 className="text-center text-lg font-semibold text-gray-700 mb-1">Total Retorno vs Ahorro</h3>
            <ChartComponent config={totalRetornoChartConfig} ariaLabel="Gráfico de barras apiladas mostrando el capital y la ganancia/interés tanto para la inversión como para el ahorro." />
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onToggleTable}
          className="bg-white text-[#00B050] border border-[#00B050] hover:bg-[#00B050]/10 font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
          aria-expanded={isTableVisible}
          aria-controls="amortization-table-container"
        >
          {isTableVisible ? 'Ocultar' : 'Ver'} Cronograma
        </button>
        <button
          onClick={handleExportPDF}
          className="ml-4 bg-white text-[#030539] border border-[#030539] hover:bg-[#030539]/10 font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
        >
          Exportar PDF
        </button>
      </div>

      {isTableVisible && (
        <div id="amortization-table-container" className="mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Cronograma de Pagos Simulado</h3>
            <AmortizationTable scheduleRows={scheduleRows} summary={summary} />
        </div>
      )}
    </div>
  );
};

// FIX: Add default export to make the component available for import in other modules.
export default ResultsDisplay;