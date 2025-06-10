import { isAddress } from "viem";

// 🎯 비즈니스 로직: 폼 검증
export interface ValidationError {
  field: string;
  message: string;
}

export interface WithdrawalFormData {
  receiver: string;
  amount: string;
  target: string;
}

export interface OwnerFormData {
  ownerAddress: string;
  actionType: "add" | "remove";
}

// Withdrawal 폼 검증
export const validateWithdrawalForm = (
  data: WithdrawalFormData
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.receiver.trim()) {
    errors.push({
      field: "receiver",
      message: "Please enter receiver address",
    });
  } else if (!isAddress(data.receiver)) {
    errors.push({ field: "receiver", message: "Invalid receiver address" });
  }

  if (!data.amount.trim()) {
    errors.push({ field: "amount", message: "Please enter amount" });
  } else if (parseFloat(data.amount) <= 0) {
    errors.push({ field: "amount", message: "Amount must be greater than 0" });
  } else if (isNaN(parseFloat(data.amount))) {
    errors.push({ field: "amount", message: "Invalid amount format" });
  }

  return errors;
};

// Owner 폼 검증
export const validateOwnerForm = (data: OwnerFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.ownerAddress.trim()) {
    errors.push({
      field: "ownerAddress",
      message: "Please enter owner address",
    });
  } else if (!isAddress(data.ownerAddress)) {
    errors.push({ field: "ownerAddress", message: "Invalid owner address" });
  }

  return errors;
};

// 첫 번째 에러 메시지 반환 (UI에서 사용)
export const getFirstError = (errors: ValidationError[]): string => {
  return errors.length > 0 ? errors[0].message : "";
};
