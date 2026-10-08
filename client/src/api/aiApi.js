/**
 * aiApi.js
 *
 * Frontend service for calling AI assistance endpoints.
 */

import axios from "axios";
import { API_PREFIX } from "../config";

const API_BASE_URL = `${API_PREFIX}/ai`;

/**
 * Check if AI features are available
 */
export const checkAIStatus = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/status`);
    return response.data;
  } catch (error) {
    console.error("Error checking AI status:", error);
    throw error;
  }
};

/**
 * Explain an error
 */
export const explainError = async (code, errorMessage, language) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/explain-error`, {
      code,
      errorMessage,
      language,
    });
    return response.data;
  } catch (error) {
    console.error("Error explaining error:", error);
    throw error;
  }
};

/**
 * Optimize code
 */
export const optimizeCode = async (code, language) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/optimize`, {
      code,
      language,
    });
    return response.data;
  } catch (error) {
    console.error("Error optimizing code:", error);
    throw error;
  }
};

/**
 * Review code
 */
export const reviewCode = async (code, language) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/review`, {
      code,
      language,
    });
    return response.data;
  } catch (error) {
    console.error("Error reviewing code:", error);
    throw error;
  }
};

/**
 * Explain code snippet
 */
export const explainCode = async (code, language) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/explain`, {
      code,
      language,
    });
    return response.data;
  } catch (error) {
    console.error("Error explaining code:", error);
    throw error;
  }
};
