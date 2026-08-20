/**
 * ErrorExplanation.jsx
 *
 * Component to display AI-powered error explanation and debugging suggestions.
 */

import { useState } from "react";
import { explainError } from "../../api/aiApi";

export default function ErrorExplanation({ code, errorMessage, errorDetails, language }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExplain = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await explainError(code, errorMessage, language, {
        stderr: errorDetails?.stderr || "",
        compileOutput: errorDetails?.compileOutput || "",
        exitCode: errorDetails?.exitCode,
        status: errorDetails?.status || "",
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to explain error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {!result ? (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">Error Message:</h3>
            <p className="text-red-800 font-mono text-sm break-words">{errorMessage}</p>
          </div>

          <button
            onClick={handleExplain}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Analyzing Error...
              </span>
            ) : (
              "🔍 Analyze Error"
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
          {/* Cause */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">🔴 Cause:</h3>
            <p className="text-red-800">{result.cause}</p>
          </div>

          {/* Location */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">📍 Location:</h3>
            <p className="text-yellow-800">{result.location}</p>
          </div>

          {/* Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📖 Explanation:</h3>
            <p className="text-blue-800">{result.explanation}</p>
          </div>

          {/* Fix */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">✅ How to Fix:</h3>
            <p className="text-green-800 whitespace-pre-wrap">{result.fix}</p>
          </div>

          {/* Corrected Code */}
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">💻 Corrected Code:</h3>
            <pre className="bg-white border border-gray-300 rounded p-3 overflow-x-auto">
              <code className="text-sm text-gray-800">{result.correctedCode}</code>
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
