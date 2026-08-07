import { useState, useCallback } from 'react';

export function useForm<T extends Record<string, any>>(initialValues: T) {
  const [data, setDataState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [processing, setProcessing] = useState(false);
  const [recentlySuccessful, setRecentlySuccessful] = useState(false);

  const setData = useCallback((keyOrData: any, value?: any) => {
    if (typeof keyOrData === 'string') {
      setDataState((prev) => ({ ...prev, [keyOrData]: value }));
    } else if (typeof keyOrData === 'function') {
      setDataState((prev) => keyOrData(prev));
    } else if (typeof keyOrData === 'object' && keyOrData !== null) {
      setDataState(keyOrData);
    }
  }, []);

  const reset = useCallback((...fields: (keyof T)[]) => {
    if (fields.length === 0) {
      setDataState(initialValues);
    } else {
      setDataState((prev) => {
        const next = { ...prev };
        fields.forEach((f) => {
          next[f] = initialValues[f];
        });
        return next;
      });
    }
    setErrors({});
  }, [initialValues]);

  const setError = useCallback((fieldOrErrors: keyof T | Record<string, string>, value?: string) => {
    if (typeof fieldOrErrors === 'string' && value !== undefined) {
      setErrors((prev) => ({ ...prev, [fieldOrErrors]: value }));
    } else if (typeof fieldOrErrors === 'object') {
      setErrors((prev) => ({ ...prev, ...fieldOrErrors }));
    }
  }, []);

  const clearErrors = useCallback((...fields: (keyof T)[]) => {
    if (fields.length === 0) {
      setErrors({});
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        fields.forEach((f) => {
          delete next[f];
        });
        return next;
      });
    }
  }, []);

  const submit = useCallback(
    (method: string = 'post', url: string = '#', options: any = {}) => {
      setProcessing(true);
      console.log(`[Inertia Stub Form Submit] ${method.toUpperCase()} to ${url}:`, data);

      setTimeout(() => {
        setProcessing(false);
        setRecentlySuccessful(true);
        if (options.onSuccess) options.onSuccess({ props: data });
        setTimeout(() => setRecentlySuccessful(false), 3000);
      }, 500);
    },
    [data]
  );

  return {
    data,
    setData,
    errors,
    setError,
    clearErrors,
    processing,
    recentlySuccessful,
    reset,
    submit,
    post: (url: string, options?: any) => submit('post', url, options),
    put: (url: string, options?: any) => submit('put', url, options),
    patch: (url: string, options?: any) => submit('patch', url, options),
    delete: (url: string, options?: any) => submit('delete', url, options),
  };
}
