import React, { useRef, useEffect } from 'react';
import type { SimulationInput } from '../types.ts';
import type flatpickr from 'flatpickr';

interface SimulationFormProps {
  inputs: SimulationInput;
  setInputs: React.Dispatch<React.SetStateAction<SimulationInput>>;
  onCalculate: () => void;
}

interface FormFieldProps {
  id: keyof SimulationInput;
  label: string;
  type: 'number' | 'date';
  value: string | Date;
  onChange: (id: keyof SimulationInput, value: string | Date) => void;
  min?: string;
  max?: string;
  step?: string;
  readOnly?: boolean;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

const useDatePicker = (
  initialDate: Date,
  onChange: (date: Date) => void
): React.RefObject<HTMLInputElement> => {
  const ref = useRef<HTMLInputElement>(null);
  const fp = useRef<flatpickr.Instance | null>(null);

  useEffect(() => {
    if (ref.current && !(window as any).flatpickr) {
      console.error("Flatpickr is not loaded");
      return;
    }
    if (ref.current && !fp.current) {
      fp.current = (window as any).flatpickr(ref.current, {
        dateFormat: 'd/m/Y',
        defaultDate: initialDate,
        onChange: (selectedDates) => {
          if (selectedDates[0]) {
            onChange(selectedDates[0]);
          }
        },
      });
    }

    return () => {
      fp.current?.destroy();
      fp.current = null;
    };
  }, [initialDate, onChange]);

  return ref;
};

const FormField: React.FC<FormFieldProps> = ({ id, label, type, value, onChange, min, max, step, readOnly, title, description, icon }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(id, e.target.value);
  };
  
  const disbursementDateRef = useDatePicker(value instanceof Date ? value : new Date(), (date) => onChange('fechaDesembolso', date));
  const firstPaymentDateRef = useDatePicker(value instanceof Date ? value : new Date(), (date) => onChange('fechaPrimerPago', date));

  const handleInvalid = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.validity.rangeUnderflow) {
      target.setCustomValidity(`El valor debe ser mayor o igual a ${min}.`);
    } else if (target.validity.rangeOverflow) {
      target.setCustomValidity(`El valor debe ser menor o igual a ${max}.`);
    } else if (target.validity.stepMismatch) {
        target.setCustomValidity(`El valor debe ser un múltiplo de ${step}.`);
    } else if (target.validity.valueMissing) {
      target.setCustomValidity('Este campo es obligatorio.');
    }
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    target.setCustomValidity('');
  };

  const commonInputClasses = `w-full bg-white py-2 px-2.5 border border-[#00B050] rounded-md text-base focus:ring-2 focus:ring-[#00B050] outline-none`;
  const iconPaddingClass = icon ? 'pl-10' : '';

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="font-semibold mb-1 text-sm text-gray-700">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        {type === 'date' ? (
          <input
            id={id}
            ref={id === 'fechaDesembolso' ? disbursementDateRef : firstPaymentDateRef}
            type="text"
            className={`${commonInputClasses} ${iconPaddingClass}`}
            placeholder="dd/mm/aaaa"
            required
          />
        ) : (
          <input
            id={id}
            type="number"
            value={value as string}
            onChange={handleChange}
            min={min}
            max={max}
            step={step}
            readOnly={readOnly}
            title={readOnly ? title : undefined}
            onInvalid={handleInvalid}
            onInput={handleInput}
            required={!readOnly}
            className={`${commonInputClasses} ${iconPaddingClass} read-only:bg-gray-100 read-only:cursor-not-allowed`}
          />
        )}
      </div>
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
  );
};


const SimulationForm: React.FC<SimulationFormProps> = ({ inputs, setInputs, onCalculate }) => {
  const handleInputChange = (id: keyof SimulationInput, value: string | Date) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate();
  };
  
  const MoneyIcon = () => <span className="font-bold text-gray-500">S/</span>;
  const PercentIcon = () => <span className="font-bold text-gray-500">%</span>;
  const HashIcon = () => <span className="font-bold text-gray-500">#</span>;
  const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

  const totalInvertido = (parseFloat(inputs.monto) || 0) * (parseInt(inputs.numInversiones, 10) || 0);

  return (
    <form onSubmit={handleSubmit} aria-labelledby="form-heading" className="space-y-4 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
        <FormField
          id="monto"
          label="Monto a Invertir"
          type="number"
          min="100"
          max="20000"
          icon={<MoneyIcon />}
          value={inputs.monto}
          onChange={handleInputChange}
        />
        <FormField
          id="tea"
          label="TEA Efectiva Anual"
          type="number"
          min="10"
          max="113.16"
          step="0.01"
          icon={<PercentIcon />}
          value={inputs.tea}
          onChange={handleInputChange}
        />
        <FormField
          id="plazo"
          label="N° de Cuotas"
          type="number"
          min="1"
          max="12"
          icon={<HashIcon />}
          value={inputs.plazo}
          onChange={handleInputChange}
        />
        <FormField
          id="fechaDesembolso"
          label="Fecha Desembolso"
          type="date"
          icon={<CalendarIcon />}
          value={inputs.fechaDesembolso}
          onChange={handleInputChange}
        />
        <FormField
          id="fechaPrimerPago"
          label="Fecha 1er Pago"
          type="date"
          icon={<CalendarIcon />}
          value={inputs.fechaPrimerPago}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <h3 className="font-bold text-[#00B050] mb-4 text-lg">Datos para comparar</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-start">
            <FormField
              id="numInversiones"
              label="N° de Préstamos"
              type="number"
              min="1"
              max="10"
              icon={<HashIcon />}
              value={inputs.numInversiones}
              onChange={handleInputChange}
              description="Multiplica tu ganancia."
            />
             <div className="flex flex-col">
                <label htmlFor="totalInvertido" className="font-semibold mb-1 text-sm text-gray-700">
                  Monto Total Invertido
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <MoneyIcon />
                  </div>
                  <input
                    id="totalInvertido"
                    type="text"
                    readOnly
                    value={totalInvertido.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    className="w-full bg-gray-100 py-2 px-2.5 pl-10 border border-gray-300 rounded-md text-base cursor-not-allowed focus:ring-2 focus:ring-[#00B050] outline-none"
                    aria-label="Monto total invertido"
                    title="Este valor es calculado (Monto a Invertir x N° de Préstamos)."
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Monto a Invertir x N° de Préstamos.</p>
              </div>
            <FormField
              id="tasaDPF"
              label="Tasa Plazo Fijo del SF"
              type="number"
              min="0"
              step="0.01"
              readOnly={true}
              icon={<PercentIcon />}
              value={inputs.tasaDPF}
              onChange={handleInputChange}
              description="Tasa fija oct 25 (SBS) para comparar"
            />
        </div>
      </div>
      
      <div className="flex justify-center pt-4">
        <button
          type="submit"
          className="bg-[#00B050] text-white hover:bg-[#009a44] font-bold py-2 px-8 rounded-lg transition-colors duration-300"
        >
          Simular Ganancia
        </button>
      </div>
    </form>
  );
};

export default SimulationForm;