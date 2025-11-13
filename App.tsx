import React, { useState, useCallback } from 'react';
import type { SimulationInput, CalculationResult } from './types';
import SimulationForm from './components/SimulationForm';
import ResultsDisplay from './components/ResultsDisplay';
import { calculateSchedule } from './utils/calculations';

const getInitialInputs = (): SimulationInput => {
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);
  
  return {
    monto: '2000',
    tea: '70',
    plazo: '12',
    fechaDesembolso: today,
    fechaPrimerPago: nextMonth,
    numInversiones: '1',
    tasaDPF: '4.28',
  };
};

const App: React.FC = () => {
  const [inputs, setInputs] = useState<SimulationInput>(getInitialInputs);
  
  const [results, setResults] = useState<CalculationResult | null>(() => {
    try {
      return calculateSchedule(getInitialInputs());
    } catch (e) {
      console.error("Initial calculation failed:", e);
      return null;
    }
  });

  const [error, setError] = useState<string | null>(null);
  const [isTableVisible, setIsTableVisible] = useState(false);

  const handleCalculate = useCallback(() => {
    try {
      setError(null);
      const calculationResult = calculateSchedule(inputs);
      setResults(calculationResult);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
        alert(`❌ ${e.message}`);
      } else {
        setError('An unknown error occurred.');
        alert('❌ An unknown error occurred.');
      }
      setResults(null);
    }
  }, [inputs]);

  return (
    <div className="bg-[#F0F4F8] min-h-screen text-gray-800 p-2 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg">
        <div className="p-4 sm:p-6 md:p-8">
          <header className="mb-6">
            <div className="text-center border-b-2 border-gray-200 pb-3">
              <h1 className="text-2xl md:text-3xl font-bold text-[#00B050]">
                Simulador de Micro Inversión
              </h1>
              <p className="text-base md:text-lg text-gray-700 mt-3">
                Calcula la rentabilidad por invertir directamente en préstamos
              </p>
            </div>
            <div className="mt-4">
              <h2 id="form-heading" className="text-lg font-bold text-[#00B050]">
                ¿Cuánto quieres Prestar?
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Ingresa los datos para simular tu ganancia
              </p>
            </div>
          </header>

          <main>
            <SimulationForm
              inputs={inputs}
              setInputs={setInputs}
              onCalculate={handleCalculate}
            />
            {error && (
              <div role="alert" className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-md">
                <p><strong>Error:</strong> {error}</p>
              </div>
            )}
            {results && (
              <ResultsDisplay
                results={results}
                isTableVisible={isTableVisible}
                onToggleTable={() => setIsTableVisible(prev => !prev)}
              />
            )}
          </main>
        </div>
        <footer className="text-center text-sm text-gray-500 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <p>&copy; 2025 Simulador de Micro Inversión. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;