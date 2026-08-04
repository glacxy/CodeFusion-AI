/**
 * CodeReview.jsx
 *
 * Component to display AI-powered code review results.
 */

import { useState } from "react";
import { reviewCode } from "../../api/aiApi";

export default function CodeReview({ code, language }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleReview = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewCode(code, language);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to review code");
    } finally {
      setLoading(false);
    }
  };

  const renderList = (items, label, color, icon) => {
    if (!items || items.length === 0) return null;

    const colorClasses = {
      red: "bg-red-50 border-red-200 text-red-900 text-red-800",
      yellow: "bg-yellow-50 border-yellow-200 text-yellow-900 text-yellow-800",
      blue: "bg-blue-50 border-blue-200 text-blue-900 text-blue-800",
      green: "bg-green-50 border-green-200 text-green-900 text-green-800",
    };

    const classes = colorClasses[color];
    const [bgBorder, borderColor, titleColor, itemColor] = classes.split(" ");

    return (
      <div className={`${bgBorder} border rounded-lg p-4`}>
        <h3 className={`font-semibold ${titleColor} mb-2`}>
          {icon} {label}
        </h3>
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className={`${itemColor} flex gap-2`}>
              <span>•</span> {typeof item === "string" ? item : JSON.stringify(item)}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="p-6">
      {!result ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Click the button below to review your code for bugs, security issues, and quality improvements.
          </p>

          <button
            onClick={handleReview}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Reviewing Code...
              </span>
            ) : (
              "🔍 Review This Code"
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
          {/* Overall Score */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📊 Overall Score:</h3>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-blue-600">{result.overallScore}/10</div>
              <div className="w-32 bg-gray-300 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    result.overallScore >= 8
                      ? "bg-green-500"
                      : result.overallScore >= 6
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${result.overallScore * 10}%` }}
                ></div>
              </div>
            </div>
          </div>

          {renderList(result.bugs, "Bugs", "red", "🐛")}
          {renderList(result.securityIssues, "Security Issues", "red", "🔒")}
          {renderList(result.codeQuality, "Code Quality Issues", "yellow", "⚠️")}
          {renderList(result.bestPractices, "Best Practices Violations", "yellow", "📋")}
          {renderList(result.improvements, "Improvements", "green", "✨")}

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
