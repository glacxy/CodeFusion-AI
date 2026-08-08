/**
 * CodeOptimization.jsx
 *
 * Component to display AI-powered code optimization suggestions.
 */

import { useState } from "react";
import { optimizeCode } from "../../api/aiApi";

export default function CodeOptimization({ code, language }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await optimizeCode(code, language);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to optimize code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {!result ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Click the button below to analyze your code for performance optimization opportunities.
          </p>

          <button
            onClick={handleOptimize}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Analyzing Code...
              </span>
            ) : (
              "⚡ Optimize This Code"
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
          {/* Time Complexity */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">⏱️ Time Complexity:</h3>
            <p className="text-purple-800 font-mono text-lg">{result.timeComplexity}</p>
          </div>

          {/* Space Complexity */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h3 className="font-semibold text-indigo-900 mb-2">💾 Space Complexity:</h3>
            <p className="text-indigo-800 font-mono text-lg">{result.spaceComplexity}</p>
          </div>

          {/* Performance Issues */}
          {result.performanceIssues && result.performanceIssues.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2">⚠️ Performance Issues:</h3>
              <ul className="space-y-2">
                {result.performanceIssues.map((issue, idx) => (
                  <li key={idx} className="text-red-800 flex gap-2">
                    <span>•</span> {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Optimization Strategy */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">💡 Optimization Strategy:</h3>
            <p className="text-green-800 whitespace-pre-wrap">{result.optimizationStrategy}</p>
          </div>

          {/* Optimized Code */}
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">✨ Optimized Code:</h3>
            <pre className="bg-white border border-gray-300 rounded p-3 overflow-x-auto">
              <code className="text-sm text-gray-800">{result.optimizedCode}</code>
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
