import { useState } from 'react';

const BUTTONS = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
];

export default function Calculator({ onClose }) {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState(null);
  const [op, setOp] = useState(null);
  const [fresh, setFresh] = useState(false);

  const handleBtn = (val) => {
    if (val === 'C') {
      setDisplay('0'); setPrev(null); setOp(null); setFresh(false); return;
    }
    if (val === '±') { setDisplay((d) => String(-parseFloat(d))); return; }
    if (val === '%') { setDisplay((d) => String(parseFloat(d) / 100)); return; }

    if (['÷', '×', '−', '+'].includes(val)) {
      setPrev(parseFloat(display));
      setOp(val);
      setFresh(true);
      return;
    }

    if (val === '=') {
      if (op === null || prev === null) return;
      const cur = parseFloat(display);
      const ops = { '÷': prev / cur, '×': prev * cur, '−': prev - cur, '+': prev + cur };
      const result = parseFloat(ops[op].toFixed(10)).toString();
      setDisplay(result);
      setPrev(null); setOp(null); setFresh(false);
      return;
    }

    if (val === '.' && display.includes('.') && !fresh) return;
    if (fresh) { setDisplay(val === '.' ? '0.' : val); setFresh(false); return; }
    setDisplay((d) => d === '0' && val !== '.' ? val : d + val);
  };

  const btnClass = (val) => {
    if (val === '=') return 'bg-orange-500 hover:bg-orange-600 text-white col-span-1';
    if (['÷', '×', '−', '+'].includes(val)) return 'bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold';
    if (['C', '±', '%'].includes(val)) return 'bg-gray-200 hover:bg-gray-300 text-gray-700';
    return 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-100';
  };

  return (
    <div className="fixed bottom-20 right-6 z-50 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-orange-500">
        <span className="text-white text-sm font-semibold">🧮 Calculator</span>
        <button onClick={onClose} className="text-white hover:text-orange-200 text-lg leading-none">✕</button>
      </div>

      {/* Display */}
      <div className="px-4 py-3 bg-gray-50 text-right">
        {op && <p className="text-xs text-gray-400">{prev} {op}</p>}
        <p className="text-3xl font-light text-gray-800 truncate">{display}</p>
      </div>

      {/* Buttons */}
      <div className="p-3 grid grid-cols-4 gap-2">
        {BUTTONS.flat().map((val, i) => (
          <button
            key={i}
            onClick={() => handleBtn(val)}
            className={`rounded-xl py-3 text-sm font-semibold transition-all ${btnClass(val)} ${val === '0' ? 'col-span-2' : ''}`}
          >
            {val}
          </button>
        ))}
      </div>
    </div>
  );
}
