"use client";
import { useState, FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:8000/api";

export default function CreatePollPage() {
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleOptionChange = (idx: number, value: string) => {
    setOptions((opts: string[]) => opts.map((opt: string, i: number) => (i === idx ? value : opt)));
  };

  const addOption = () => {
    setOptions((opts: string[]) => [...opts, ""]);
  };

  const removeOption = (idx: number) => {
    if (options.length <= 2) return;
    setOptions((opts: string[]) => opts.filter((_: string, i: number) => i !== idx));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!question.trim() || options.some((opt) => !opt.trim())) {
      setError("Сұрақ пен барлық нұсқаларды толтырыңыз");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/poll/create`, {
        question,
        options,
      });
      router.push("/"); // Success: redirect to main page
    } catch (err) {
      setError("Сервер қатесі. Кейінірек қайталап көріңіз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
      <div className="w-full max-w-xl p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center">Жаңа опрос құру</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Сұрақ</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Нұсқалар</label>
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center mb-2">
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="ml-2 text-red-500 font-bold"
                    onClick={() => removeOption(idx)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="mt-2 px-4 py-1 bg-blue-500 text-white rounded"
              onClick={addOption}
            >
              + Нұсқа қосу
            </button>
          </div>
          {error && <div className="text-red-600 font-semibold">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white font-bold rounded-lg mt-4 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Жіберілуде..." : "Опрос құру"}
          </button>
        </form>
      </div>
    </main>
  );
} 