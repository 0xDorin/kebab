"use client";

import { useState, useCallback } from "react";

// 🎯 비즈니스 로직: 폼 상태 관리
export interface FormState {
  isSubmitting: boolean;
  error: string;
  success: string;
}

export const useFormState = () => {
  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
    error: "",
    success: "",
  });

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setFormState((prev) => ({ ...prev, isSubmitting }));
  }, []);

  const setError = useCallback((error: string) => {
    setFormState((prev) => ({ ...prev, error, success: "" }));
  }, []);

  const setSuccess = useCallback((success: string) => {
    setFormState((prev) => ({ ...prev, success, error: "" }));
  }, []);

  const clearMessages = useCallback(() => {
    setFormState((prev) => ({ ...prev, error: "", success: "" }));
  }, []);

  const reset = useCallback(() => {
    setFormState({
      isSubmitting: false,
      error: "",
      success: "",
    });
  }, []);

  return {
    formState,
    setSubmitting,
    setError,
    setSuccess,
    clearMessages,
    reset,
    // 편의 속성들
    isSubmitting: formState.isSubmitting,
    error: formState.error,
    success: formState.success,
    hasError: !!formState.error,
    hasSuccess: !!formState.success,
  };
};
