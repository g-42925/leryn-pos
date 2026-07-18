"use client"

import { useEffect } from "react";
import { useActionState } from "react";
import { FormState } from "@/app/actions/login";

type Action<T> = (prev: FormState<T>, formData: FormData) => Promise<FormState<T>>

type UseFormActionOptions<T> = {
  onSuccess?: (state: FormState<T>) => void;
  onError?: (state: FormState<T>) => void;
  onSettled?: (state: FormState<T>) => void; // Selalu jalan baik sukses maupun gagal
}


function useFormAction<T>(act: Action<T>, options?: UseFormActionOptions<T>) {
  const interceptedAct = async (prev: FormState<T>, formData: FormData) => {
    const nextState = await act(prev, formData);

    if (nextState.success) {
      options?.onSuccess?.(nextState);
    }
    else {
      options?.onError?.(nextState);
    }

    options?.onSettled?.(nextState);

    return nextState;
  };

  const [state, formAction, isPending] = useActionState<FormState<T>, FormData>(interceptedAct, {
    message: "",
    success: false,
  });



  return {
    formAction,
    isPending,
    state,
  }
}

export {
  useFormAction
}