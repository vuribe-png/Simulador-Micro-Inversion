import type { SimulationInput, CalculationResult, ScheduleRow } from '../types';
import { formatDate } from './formatters';

// --- Funciones para el cálculo de feriados y días hábiles ---

// Cache para almacenar los feriados por año y evitar recálculos.
const holidayCache = new Map<number, Set<string>>();

// Calcula el Domingo de Pascua para un año dado usando el algoritmo Gregoriano anónimo.
function getEasterSunday(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    // El mes en el objeto Date de JS es base 0 (0-11)
    return new Date(year, month - 1, day);
}

// Devuelve una lista de todos los feriados para un año específico en Perú.
function getHolidaysForYear(year: number): Date[] {
    const easter = getEasterSunday(year);
    const goodFriday = new Date(easter);
    goodFriday.setDate(easter.getDate() - 2);
    const maundyThursday = new Date(easter);
    maundyThursday.setDate(easter.getDate() - 3);

    // El mes es base 0 (0 = Enero, 11 = Diciembre)
    const holidays = [
        new Date(year, 0, 1),   // Año Nuevo
        new Date(year, 4, 1),   // Día del Trabajo
        new Date(year, 5, 7),   // Batalla de Arica
        new Date(year, 5, 29),  // San Pedro y San Pablo
        new Date(year, 6, 23),  // Día de la Fuerza Aérea
        new Date(year, 6, 28),  // Fiestas Patrias
        new Date(year, 6, 29),  // Fiestas Patrias
        new Date(year, 7, 6),   // Batalla de Junín
        new Date(year, 7, 30),  // Santa Rosa de Lima
        new Date(year, 9, 8),   // Combate de Angamos
        new Date(year, 10, 1),  // Todos los Santos
        new Date(year, 11, 8),  // Inmaculada Concepción
        new Date(year, 11, 9),  // Batalla de Ayacucho
        new Date(year, 11, 25), // Navidad
        maundyThursday,
        goodFriday,
    ];
    return holidays;
}

// Obtiene los feriados de la caché o los calcula y los guarda.
function getCachedHolidaysForYear(year: number): Set<string> {
    if (holidayCache.has(year)) {
        return holidayCache.get(year)!;
    }

    const holidays = getHolidaysForYear(year);
    const holidaySetForYear = new Set<string>();
    holidays.forEach(h => {
        // Se guarda como 'YYYY-M-D' para evitar problemas de zona horaria.
        const dateKey = `${h.getFullYear()}-${h.getMonth()}-${h.getDate()}`;
        holidaySetForYear.add(dateKey);
    });

    holidayCache.set(year, holidaySetForYear);
    return holidaySetForYear;
}

// Un Set para almacenar los feriados y hacer búsquedas rápidas.
const holidaySet = new Set<string>();

// Genera el Set de feriados para un rango de años, usando una caché para la eficiencia.
function generateHolidaySet(startYear: number, endYear: number) {
    holidaySet.clear();
    for (let year = startYear; year <= endYear; year++) {
        const holidaysForYear = getCachedHolidaysForYear(year);
        holidaysForYear.forEach(holiday => holidaySet.add(holiday));
    }
}

// Verifica si una fecha es domingo o feriado.
function isHolidayOrSunday(date: Date): boolean {
    if (date.getDay() === 0) return true; // Domingo
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return holidaySet.has(dateKey);
}

// Ajusta una fecha al siguiente día hábil si cae en domingo o feriado.
function adjustToNextBusinessDay(date: Date): Date {
    const adjustedDate = new Date(date.getTime());
    while (isHolidayOrSunday(adjustedDate)) {
        adjustedDate.setDate(adjustedDate.getDate() + 1);
    }
    return adjustedDate;
}


function daysBetween(date1: Date, date2: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const startOfDay1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const startOfDay2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const diffMs = startOfDay2.getTime() - startOfDay1.getTime();
  return Math.round(diffMs / msPerDay);
}

function addFixedMonth(date: Date, months: number, fixedDay: number): Date {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  let dayOfMonth = fixedDay;
  const lastDayOfMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
  if (dayOfMonth > lastDayOfMonth) dayOfMonth = lastDayOfMonth;
  newDate.setDate(dayOfMonth);
  return newDate;
}

function XIRR(values: number[], dates: Date[], guess = 0.1): number {
    const daysInYear = 365.0; const maxIterations = 100; const tolerance = 1e-7;
    const data = values.map((value, i) => ({ value, date: dates[i] })).sort((a, b) => a.date.getTime() - b.date.getTime());
    const valuesSorted = data.map(d => d.value); const datesSorted = data.map(d => d.date);
    const firstDate = datesSorted[0]; const days = datesSorted.map(date => daysBetween(firstDate, date));

    const f_npv = (rate: number) => valuesSorted.reduce((sum, val, i) => sum + val / Math.pow(1 + rate, days[i] / daysInYear), 0);
    const f_npv_prime = (rate: number) => valuesSorted.reduce((sum, val, i) => days[i] > 0 ? sum - (days[i] * val) / (daysInYear * Math.pow(1 + rate, (days[i] / daysInYear) + 1)) : sum, 0);

    let rate = guess;
    for (let i = 0; i < maxIterations; i++) {
        const npv = f_npv(rate); const npv_prime = f_npv_prime(rate);
        if (Math.abs(npv) < tolerance) return rate; if (npv_prime === 0) break;
        rate = rate - (npv / npv_prime);
    }
    return NaN;
}

function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function calculateSchedule(inputs: SimulationInput): CalculationResult {
    const monto = parseFloat(inputs.monto);
    const teaValue = parseFloat(inputs.tea);
    const plazo = parseInt(inputs.plazo, 10);
    const numInversiones = parseInt(inputs.numInversiones, 10);
    const tasaDPFAnualValue = parseFloat(inputs.tasaDPF);
    const { fechaDesembolso, fechaPrimerPago } = inputs;
    
    if (isNaN(monto) || monto < 100 || monto > 20000) throw new Error("Monto de Préstamo inválido. Debe estar entre S/ 100.00 y S/ 20,000.00.");
    if (isNaN(teaValue) || teaValue < 10 || teaValue > 113.16) throw new Error("TEA Efectiva Anual inválida. Debe estar entre 10% y 113.16%.");
    const tea = teaValue / 100;
    if (isNaN(plazo) || plazo < 1 || plazo > 12) throw new Error("N° de Cuotas inválido. Debe estar entre 1 y 12.");
    if (isNaN(numInversiones) || numInversiones < 1 || numInversiones > 10) throw new Error("N° de Inversiones inválido. Debe estar entre 1 y 10.");
    if (isNaN(tasaDPFAnualValue) || tasaDPFAnualValue < 0) throw new Error("Tasa Plazo Fijo del SF (%) inválida. No puede ser negativa.");
    const tasaDPFAnual = tasaDPFAnualValue / 100;
    if (!fechaDesembolso || isNaN(fechaDesembolso.getTime())) throw new Error("Fecha de Desembolso inválida.");
    if (!fechaPrimerPago || isNaN(fechaPrimerPago.getTime())) throw new Error("Fecha de 1er Pago inválida.");
    if (fechaPrimerPago <= fechaDesembolso) throw new Error("La Fecha de 1er Pago debe ser posterior a la Fecha de Desembolso.");

    const startYear = fechaDesembolso.getFullYear();
    const estimatedEndDate = new Date(fechaPrimerPago);
    estimatedEndDate.setMonth(estimatedEndDate.getMonth() + plazo);
    const endYear = estimatedEndDate.getFullYear();
    generateHolidaySet(startYear, endYear);

    const ted_full = Math.pow(1 + tea, 1 / 360) - 1;
    const fixedDayOfPayment = fechaPrimerPago.getDate();

    const paymentDates: Date[] = [];
    const periods: number[] = [];
    let previousDate = fechaDesembolso;
    for (let i = 1; i <= plazo; i++) {
        let paymentDate = (i === 1) ? fechaPrimerPago : addFixedMonth(fechaPrimerPago, i - 1, fixedDayOfPayment);
        paymentDate = adjustToNextBusinessDay(paymentDate);
        paymentDates.push(paymentDate);
        const period = daysBetween(previousDate, paymentDate);
        if (period <= 0) throw new Error(`El período para la cuota ${i} es inválido. Revise las fechas.`);
        periods.push(period);
        previousDate = paymentDate;
    }

    let diasAcumulados = 0;
    const sumaFSA = periods.reduce((sum, period) => {
        diasAcumulados += period;
        return sum + Math.pow(1 + ted_full, -diasAcumulados);
    }, 0);

    if (sumaFSA <= 0) throw new Error("Error en el cálculo del factor de actualización. Verifique la TEA.");
    
    const cuotaFija = round2(monto / sumaFSA);
    
    const scheduleRows: ScheduleRow[] = [];
    let saldoCapital = monto;
    const gastosFijos = 0;
    
    scheduleRows.push({
        cuotaNum: 'Desem',
        fechaPago: formatDate(fechaDesembolso),
        periodo: 0,
        saldoCapital: monto,
        amortizacionCapital: 0,
        interesPeriodo: 0,
        cuotaParcial: 0,
        gastos: 0,
        cuotaTotal: 0,
        itf: 0,
        totalAPagar: 0
    });
    
    for (let i = 0; i < plazo; i++) {
        const cuotaNum = i + 1;
        const fechaPago = paymentDates[i];
        const periodo = periods[i];

        if (saldoCapital < 0.01) {
            scheduleRows.push({
                cuotaNum, fechaPago: formatDate(fechaPago), periodo,
                saldoCapital: 0, amortizacionCapital: 0, interesPeriodo: 0, cuotaParcial: 0,
                gastos: 0, cuotaTotal: 0, itf: 0, totalAPagar: 0
            });
            continue;
        }

        const interesPeriodo = saldoCapital * (Math.pow(1 + ted_full, periodo) - 1);
        
        let amortizacionCapital: number;
        let cuotaParcial: number;

        if (cuotaNum < plazo && (saldoCapital + interesPeriodo) > cuotaFija) {
            cuotaParcial = cuotaFija;
            amortizacionCapital = cuotaParcial - interesPeriodo;
        } else {
            amortizacionCapital = saldoCapital;
            cuotaParcial = amortizacionCapital + interesPeriodo;
        }
        
        let nuevoSaldo = saldoCapital - amortizacionCapital;
        if (cuotaNum === plazo) {
            nuevoSaldo = 0;
        }
        
        const cuotaTotal = cuotaParcial + gastosFijos;
        const itfCalculado = cuotaTotal * 0.00005;
        const totalAPagar = cuotaTotal + itfCalculado;

        scheduleRows.push({
            cuotaNum,
            fechaPago: formatDate(fechaPago),
            periodo,
            saldoCapital: round2(nuevoSaldo),
            amortizacionCapital: round2(amortizacionCapital),
            interesPeriodo: round2(interesPeriodo),
            cuotaParcial: round2(cuotaParcial),
            gastos: gastosFijos,
            cuotaTotal: round2(cuotaTotal),
            itf: round2(itfCalculado),
            totalAPagar: round2(totalAPagar)
        });
        
        saldoCapital = nuevoSaldo;
    }
    
    const paymentRows = scheduleRows.slice(1);
    const flujos = [-monto, ...paymentRows.map(r => r.totalAPagar)];
    const fechasFlujos = [fechaDesembolso, ...paymentRows.map(r => new Date(r.fechaPago.split('/').reverse().join('-')))];
    const tcea = XIRR(flujos, fechasFlujos);

    const summary = {
      totalAmortizacion: round2(paymentRows.reduce((sum, r) => sum + r.amortizacionCapital, 0)),
      totalInteres: round2(paymentRows.reduce((sum, r) => sum + r.interesPeriodo, 0)),
      totalCuotaFija: round2(paymentRows.reduce((sum, r) => sum + r.cuotaParcial, 0)),
      totalGastos: round2(paymentRows.reduce((sum, r) => sum + r.gastos, 0)),
      totalCuotaTotal: round2(paymentRows.reduce((sum, r) => sum + r.cuotaTotal, 0)),
      totalITF: round2(paymentRows.reduce((sum, r) => sum + r.itf, 0)),
      totalAPagar: round2(paymentRows.reduce((sum, r) => sum + r.totalAPagar, 0)),
      sumaFSA, tea, tcea
    };
    
    const diff = round2(monto - summary.totalAmortizacion);
    if (Math.abs(diff) > 0) {
        const lastPaidRow = scheduleRows.slice().reverse().find(r => r.amortizacionCapital > 0);
        if (lastPaidRow) {
            lastPaidRow.amortizacionCapital += diff;
            summary.totalAmortizacion += diff;
        }
    }

    const rentabilidadPrestamo = summary.totalInteres / monto;
    const tasaDPFProporcionalPlazo = (tasaDPFAnual / 12) * plazo;
    const gananciaDPFProporcional = monto * tasaDPFProporcionalPlazo * numInversiones;
    const gananciaPrestamo = summary.totalInteres * numInversiones;
    const capitalTotalInversion = monto * numInversiones;
    const capitalTotalAhorro = monto * numInversiones;
    
    const charts = {
        rentabilidad: { prestamo: rentabilidadPrestamo, dpf: tasaDPFProporcionalPlazo },
        ganancia: { prestamo: gananciaPrestamo, dpf: gananciaDPFProporcional },
        retorno: { capitalInversion: capitalTotalInversion, gananciaPyme: gananciaPrestamo, capitalAhorro: capitalTotalAhorro, interesDPF: gananciaDPFProporcional }
    };
    
    return { scheduleRows, summary, charts };
}
