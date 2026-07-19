import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type UseFormReturn,
} from 'react-hook-form';
import type { ZodType } from 'zod';

interface UseFormValidationOptions<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: DefaultValues<T>;
}

/**
 * Тонкая обёртка над react-hook-form + zod с единой стратегией валидации:
 * первичная проверка на blur, затем перевалидация на каждый ввод (реактивные ошибки).
 */
export function useFormValidation<T extends FieldValues>({
  schema,
  defaultValues,
}: UseFormValidationOptions<T>): UseFormReturn<T> {
  return useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });
}
