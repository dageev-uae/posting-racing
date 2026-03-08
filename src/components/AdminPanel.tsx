import { useState } from "react";
import type { Racer } from "../types";
import { getNextSprite } from "../store";

interface AdminPanelProps {
  racers: Racer[];
  onUpdate: (racers: Racer[]) => void;
}

export function AdminPanel({ racers, onUpdate }: AdminPanelProps) {
  const [newName, setNewName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const addRacer = () => {
    if (!newName.trim()) return;
    const racer: Racer = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      sprite: getNextSprite(racers),
      hours: 0,
    };
    onUpdate([...racers, racer]);
    setNewName("");
  };

  const updateHours = (id: string, hours: number) => {
    onUpdate(
      racers.map((r) => (r.id === id ? { ...r, hours: Math.max(0, hours) } : r))
    );
  };

  const removeRacer = (id: string) => {
    onUpdate(racers.filter((r) => r.id !== id));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-indigo-600 hover:bg-indigo-500 text-[8px] px-4 py-2 rounded cursor-pointer z-50"
      >
        ADMIN
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 w-[480px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[10px] text-yellow-400">RACE ADMIN</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white text-[10px] cursor-pointer"
          >
            CLOSE
          </button>
        </div>

        {/* Add racer */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addRacer()}
            placeholder="Racer name..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-[8px] text-white outline-none focus:border-indigo-500"
          />
          <button
            onClick={addRacer}
            className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-[8px] cursor-pointer"
          >
            ADD
          </button>
        </div>

        {/* Racer list */}
        <div className="space-y-2">
          {racers.map((racer) => (
            <div
              key={racer.id}
              className="flex items-center gap-2 bg-gray-700/50 rounded p-2"
            >
              <img
                src={racer.sprite}
                alt="car"
                className="w-6 h-auto shrink-0"
              />
              <span className="text-[8px] flex-1 truncate">{racer.name}</span>
              <input
                type="number"
                value={racer.hours}
                onChange={(e) =>
                  updateHours(racer.id, parseFloat(e.target.value) || 0)
                }
                className="w-16 bg-gray-600 border border-gray-500 rounded px-1 py-0.5 text-[8px] text-white text-right outline-none focus:border-indigo-500"
                min="0"
                step="0.5"
              />
              <span className="text-[7px] text-gray-400">hrs</span>
              <button
                onClick={() => removeRacer(racer.id)}
                className="text-red-400 hover:text-red-300 text-[8px] cursor-pointer px-1"
              >
                X
              </button>
            </div>
          ))}
        </div>

        {racers.length === 0 && (
          <p className="text-[8px] text-gray-500 text-center py-4">
            No racers yet. Add one above!
          </p>
        )}
      </div>
    </div>
  );
}
