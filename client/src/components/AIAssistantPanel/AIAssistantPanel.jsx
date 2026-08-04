/**
 * AIAssistantPanel.jsx
 *
 * Main component for displaying AI assistance features.
 * Shows different panels based on the selected feature type.
 */

import { useState, useEffect } from "react";
import { checkAIStatus } from "../../api/aiApi";
import ErrorExplanation from "./ErrorExplanation";
import CodeOptimization from "./CodeOptimization";
import CodeReview from "./CodeReview";
import CodeExplanation from "./CodeExplanation";

export default function AIAssistantPanel({ 
  isOpen, 
  onClose, 
  code, 
  language, 
  errorMessage,
  selectedCode 
}) {
  const [activeTab, setActiveTab] = useState("error");
  const [aiAvailable, setAiAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAI = async () => {
      try {
        const status = await checkAIStatus();
        setAiAvailable(status.available);
      } catch (error) {
        console.error("Failed to check AI status:", error);
        setAiAvailable(false);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      checkAI();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">🤖 AI Assistant</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
          >
            ✕
          </button>
        </div>

        {/* Status Message */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin mb-4">
                <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              </div>
              <p className="text-gray-600">Checking AI availability...</p>
            </div>
          </div>
        ) : !aiAvailable ? (
          <div className="flex-1 flex items-center justify-center bg-yellow-50 border border-yellow-200 m-6 rounded-lg">
            <div className="text-center">
              <p className="text-yellow-800 text-lg font-semibold mb-2">⚠️ AI Service Not Available</p>
              <p className="text-yellow-700">
                Please configure the Claude API key (CLAUDE_API_KEY environment variable) to use AI features.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200 bg-gray-50 px-6 flex gap-2">
              {errorMessage && (
                <button
                  onClick={() => setActiveTab("error")}
                  className={`px-4 py-3 font-medium transition ${
                    activeTab === "error"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  🐛 Error Explanation
                </button>
              )}
              {selectedCode && (
                <button
                  onClick={() => setActiveTab("explain")}
                  className={`px-4 py-3 font-medium transition ${
                    activeTab === "explain"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  📝 Explain Code
                </button>
              )}
              <button
                onClick={() => setActiveTab("optimize")}
                className={`px-4 py-3 font-medium transition ${
                  activeTab === "optimize"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                ⚡ Optimize
              </button>
              <button
                onClick={() => setActiveTab("review")}
                className={`px-4 py-3 font-medium transition ${
                  activeTab === "review"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                🔍 Review
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === "error" && errorMessage && (
                <ErrorExplanation 
                  code={code} 
                  errorMessage={errorMessage} 
                  language={language} 
                />
              )}
              {activeTab === "explain" && selectedCode && (
                <CodeExplanation 
                  code={selectedCode} 
                  language={language} 
                />
              )}
              {activeTab === "optimize" && (
                <CodeOptimization 
                  code={code} 
                  language={language} 
                />
              )}
              {activeTab === "review" && (
                <CodeReview 
                  code={code} 
                  language={language} 
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
