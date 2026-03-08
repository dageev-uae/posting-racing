import { useState, useRef } from "react";
import type { Racer } from "../types";
import { getNextSprite } from "../store";

interface AdminPanelProps {
  racers: Racer[];
  onUpdate: (racers: Racer[], password: string) => void;
  onRefresh: () => void;
}

export function AdminPanel({ racers, onUpdate, onRefresh }: AdminPanelProps) {
  const [newName, setNewName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setShowLogin(false);
        setIsOpen(true);
        setLoginError(false);
      } else {
        setLoginError(true);
      }
    } catch {
      setLoginError(true);
    }
  };

  const authHeaders = (): HeadersInit => ({ Authorization: password });

  const addRacer = () => {
    if (!newName.trim()) return;
    const racer: Racer = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      sprite: getNextSprite(racers),
      hours: 0,
    };
    onUpdate([...racers, racer], password);
    setNewName("");
  };

  const updateHours = (id: string, hours: number) => {
    onUpdate(
      racers.map((r) => (r.id === id ? { ...r, hours: Math.max(0, hours) } : r)),
      password
    );
  };

  const removeRacer = (id: string) => {
    onUpdate(racers.filter((r) => r.id !== id), password);
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setUploadStatus("Uploading...");
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: authHeaders(),
        body: form,
      });
      const data = await res.json();
      if (res.ok) {
        setUploadStatus(`Updated ${data.parsed} racers`);
        onRefresh();
      } else {
        setUploadStatus(`Error: ${data.error}`);
      }
    } catch {
      setUploadStatus("Upload failed");
    }

    if (fileRef.current) fileRef.current.value = "";
    setTimeout(() => setUploadStatus(null), 3000);
  };

  if (!isOpen && !showLogin) {
    return (
      <button
        onClick={() => setShowLogin(true)}
        className="fixed bottom-4 right-4 bg-indigo-600 hover:bg-indigo-500 text-[8px] px-4 py-2 rounded cursor-pointer z-50"
      >
        ADMIN
      </button>
    );
  }

  if (showLogin) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 w-[300px]">
          <h2 className="text-[10px] text-yellow-400 mb-4">ENTER PASSWORD</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setLoginError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Password..."
            autoFocus
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-[8px] text-white outline-none focus:border-indigo-500 mb-3"
          />
          {loginError && (
            <div className="text-[8px] text-red-400 mb-3">Wrong password</div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => { setShowLogin(false); setPassword(""); setLoginError(false); }}
              className="flex-1 bg-gray-600 hover:bg-gray-500 px-3 py-1.5 rounded text-[8px] cursor-pointer"
            >
              CANCEL
            </button>
            <button
              onClick={handleLogin}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded text-[8px] cursor-pointer"
            >
              LOGIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 w-[480px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[10px] text-yellow-400">RACE ADMIN</h2>
          <button
            onClick={() => { setIsOpen(false); setPassword(""); }}
            className="text-gray-400 hover:text-white text-[10px] cursor-pointer"
          >
            CLOSE
          </button>
        </div>

        {/* Excel upload */}
        <div className="mb-4 p-3 bg-gray-700/50 rounded border border-gray-600">
          <label className="text-[8px] text-gray-300 block mb-2">
            UPLOAD POSTING EFFICIENCY XLSX
          </label>
          <div className="flex gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="flex-1 text-[8px] text-gray-300 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-[8px] file:bg-indigo-600 file:text-white file:cursor-pointer hover:file:bg-indigo-500"
            />
            <button
              onClick={handleUpload}
              className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-[8px] cursor-pointer shrink-0"
            >
              UPLOAD
            </button>
          </div>
          {uploadStatus && (
            <div className="mt-2 text-[8px] text-yellow-400">{uploadStatus}</div>
          )}
        </div>

        {/* Add racer manually */}
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
                max="100"
                step="1"
              />
              <span className="text-[7px] text-gray-400">%</span>
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
            No racers yet. Upload an Excel file or add manually!
          </p>
        )}

        {/* Clean up */}
        {racers.length > 0 && (
          <button
            onClick={() => onUpdate([], password)}
            className="mt-4 w-full bg-red-700 hover:bg-red-600 px-3 py-1.5 rounded text-[8px] cursor-pointer"
          >
            CLEAN UP — REMOVE ALL RACERS
          </button>
        )}
      </div>
    </div>
  );
}
