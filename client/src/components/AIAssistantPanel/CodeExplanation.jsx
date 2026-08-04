/**
 * CodeExplanation.jsx
 *
 * Component to display AI-powered code explanation for selected code.
 */

import { useState } from "react";
import { explainCode } from "../../api/aiApi";

export default function CodeExplanation({ code, language }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExplain = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await explainCode(code, language);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to explain code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {!result ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Selected Code:</h3>
            <pre className="bg-white border border-blue-300 rounded p-3 overflow-x-auto">
              <code className="text-sm text-blue-800">{code}</code>
            </pre>
          </div>

          <button
            onClick={handleExplain}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Explaining Code...
              </span>
            ) : (
              "📖 Explain This Code"
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Simple Explanation */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">💡 Simple Explanation:</h3>
            <p className="text-green-800">{result.simpleExplanation}</p>
          </div>

          {/* Purpose */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">🎯 Purpose:</h3>
            <p className="text-blue-800">{result.purpose}</p>
          </div>

          {/* Logic Breakdown */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">🔄 Logic Breakdown:</h3>
            <p className="text-purple-800 whitespace-pre-wrap">{result.logicBreakdown}</p>
          </div>

          {/* Key Concepts */}
          {result.keyConepts && result.keyConepts.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2">📚 Key Concepts:</h3>
              <div className="flex flex-wrap gap-2">
                {result.keyConepts.map((concept, idx) => (
                  <span
                    key={idx}
                    className="bg-orange-200 text-orange-900 px-3 py-1 rounded-full text-sm"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Example */}
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">📝 Example:</h3>
            <pre className="bg-white border border-gray-300 rounded p-3 overflow-x-auto">
              <code className="text-sm text-gray-800">{result.example}</code>
            </pre>
          </div>

          <button
            onClick={() => setResult(null)}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
