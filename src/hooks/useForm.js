import { useCallback, useRef, useState } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

/**
 * Custom hook for form handling with validation and submission
 * @param {Object} options - Form configuration options
 * @param {z.ZodSchema} options.schema - Zod schema for validation
 * @param {Function} options.onSubmit - Form submission handler
 * @param {Object} options.defaultValues - Default form values
 * @param {Object} options.mode - Validation mode (onChange, onBlur, onSubmit, onTouched, all)
 * @returns {Object} Form methods and state
 */
const useForm = ({
  schema,
  onSubmit: onSubmitProp,
  defaultValues = {},
  mode = 'onChange',
  ...options
} = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const isMounted = useRef(true);

  // Set up form with react-hook-form
  const methods = useHookForm({
    defaultValues,
    resolver: schema ? zodResolver(schema) : undefined,
    mode,
    ...options,
  });

  // Handle form submission
  const onSubmit = useCallback(
    async (data, event) => {
      if (!onSubmitProp) return;

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        await onSubmitProp(data, {
          ...methods,
          event,
          setError: (name, error) => {
            methods.setError(name, {
              type: 'manual',
              message: error.message || 'This field has an error',
            });
          },
          clearErrors: methods.clearErrors,
          setValue: methods.setValue,
        });
      } catch (error) {
        if (isMounted.current) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'An error occurred while submitting the form';
          
          setSubmitError(errorMessage);
          toast.error(errorMessage);
          
          // Handle server-side validation errors
          if (error.response?.data?.errors) {
            Object.entries(error.response.data.errors).forEach(([field, message]) => {
              methods.setError(field, {
                type: 'server',
                message: Array.isArray(message) ? message[0] : message,
              });
            });
          }
        }
      } finally {
        if (isMounted.current) {
          setIsSubmitting(false);
        }
      }
    },
    [onSubmitProp, methods]
  );

  // Handle form reset
  const reset = useCallback(
    (values) => {
      methods.reset(values || defaultValues);
      setSubmitError(null);
    },
    [defaultValues, methods.reset]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    ...methods,
    handleSubmit: methods.handleSubmit(onSubmit),
    isSubmitting,
    submitError,
    reset,
    formState: {
      ...methods.formState,
      isDirty: methods.formState.isDirty,
      isValid: methods.formState.isValid,
      isSubmitting,
      submitError,
    },
  };
};

export default useForm;
