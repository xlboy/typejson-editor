import type { ValidationError } from '../types';
import { useUpdate } from 'ahooks';
import { useSingleton } from 'foxact/use-singleton';

export default function useValidationError() {
  const errorMap = useSingleton(
    () => new Map<ValidationError['type'], Omit<ValidationError, 'type'> | null>([]),
  ).current;
  const updateContextComponent = useUpdate();

  const get = <T extends ValidationError['type']>(type: T) =>
    errorMap.get(type) as (ValidationError & { type: T }) | undefined;

  const getFirst = (): ValidationError | undefined => {
    const firstError = errorMap.entries().next().value as [any, any] | undefined;
    return firstError ? { type: firstError[0], ...firstError[1] } : undefined;
  };

  const getAll = () =>
    Array.from(errorMap.entries()).map(([type, error]) => ({
      type,
      ...error,
    })) as ValidationError[];

  const has = (type: ValidationError['type']) => errorMap.has(type);

  const set = <
    T extends ValidationError['type'],
    V extends Omit<ValidationError & { type: T }, 'type'>,
  >(
    type: T,
    ...args: [keyof V] extends [never] ? [] : [value: V]
  ) => {
    errorMap.set(type, args[0] || null);
    updateContextComponent();
  };

  const remove = (type: ValidationError['type']) => {
    errorMap.delete(type);
    updateContextComponent();
  };
  const reset = () => {
    errorMap.clear();
    updateContextComponent();
  };

  return {
    get,
    getFirst,
    getAll,

    has,

    set,
    remove,
    reset,
  };
}
