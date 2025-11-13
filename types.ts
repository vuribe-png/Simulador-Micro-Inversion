
export interface SimulationInput {
  monto: string;
  tea: string;
  plazo: string;
  fechaDesembolso: Date;
  fechaPrimerPago: Date;
  numInversiones: string;
  tasaDPF: string;
}

export interface ScheduleRow {
  cuotaNum: number | string;
  fechaPago: string;
  periodo: number;
  saldoCapital: number;
  amortizacionCapital: number;
  interesPeriodo: number;
  cuotaParcial: number;
  gastos: number;
  cuotaTotal: number;
  itf: number;
  totalAPagar: number;
}

export interface ScheduleSummary {
  totalAmortizacion: number;
  totalInteres: number;
  totalCuotaFija: number;
  totalGastos: number;
  totalCuotaTotal: number;
  totalITF: number;
  totalAPagar: number;
  sumaFSA: number;
  tea: number;
  tcea: number;
}

export interface ChartData {
  rentabilidad: {
    prestamo: number;
    dpf: number;
  };
  ganancia: {
    prestamo: number;
    dpf: number;
  };
  retorno: {
    capitalInversion: number;
    gananciaPyme: number;
    capitalAhorro: number;
    interesDPF: number;
  };
}

export interface CalculationResult {
  scheduleRows: ScheduleRow[];
  summary: ScheduleSummary;
  charts: ChartData;
}
