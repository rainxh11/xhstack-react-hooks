import { debounce, throttle } from 'lodash'
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  DependencyList,
  MutableRefObject,
} from 'react'
import { useAsyncEffect } from 'use-async-effect'

export function useStateTracked<T>(trackedValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState(trackedValue)
  useEffect(() => {
    setState(trackedValue)
  }, [trackedValue])
  return [state, setState]
}

export function useRandomState() {
  const [randomState, setRandomState] = useState<number>(Math.random())
  const randomize = () => {
    setRandomState(Math.random() * randomState)
  }

  return { randomState, randomize }
}

export function useIntervalMemo<T>(fn: () => T, interval: number) {
  const { randomState, randomize } = useRandomState()
  setInterval(() => randomize(), interval)

  const value = useMemo(fn, [randomState])
  return value
}

export function useAsyncDebouncedTrigger<T>(asyncEffectCallback: (v?: T) => Promise<void>, delay: number) {
  const debouncedChangeHandler = useMemo(() => debounce(async (v?: T) => await asyncEffectCallback(v), delay), [])
  useEffect(() => {
    return debouncedChangeHandler.cancel()
  }, [])

  return {
    trigger: debouncedChangeHandler,
  }
}

export function useDebouncedTrigger<T>(effectCallback: (v?: T) => void, delay: number) {
  const debouncedChangeHandler = useMemo(() => debounce((v?: T) => effectCallback(v), delay), [])
  useEffect(() => () => debouncedChangeHandler.cancel(), [])

  return {
    trigger: debouncedChangeHandler,
  }
}

export function useAsyncDebouncedStateEffect<T>(
  asyncEffectCallback: (debouncedValue: T) => Promise<void>,
  delay: number,
  initialValue?: T,
  memo = false,
) {
  const [value, setValue] = useState(initialValue ?? null)

  const debouncedChangeHandler = useMemo(() => debounce(async v => await asyncEffectCallback(v), delay), [])

  if (memo) {
    const cachedValue = useMemo(() => value, [value])
    useAsyncEffect(async () => await debouncedChangeHandler(value), [cachedValue])
  } else {
    useAsyncEffect(async () => await debouncedChangeHandler(value), [value])
  }

  useEffect(() => () => debouncedChangeHandler.cancel(), [])

  return [value, setValue]
}

export function useDebouncedStateEffect<T>(
  effectCallback: (debouncedValue: T) => void,
  delay: number,
  initialValue?: T,
  memo = false,
) {
  const [value, setValue] = useState(initialValue ?? null)

  const debouncedChangeHandler = useMemo(() => debounce(v => effectCallback(v), delay), [])
  if (memo) {
    const cachedValue = useMemo(() => value, [value])
    useEffect(() => {
      debouncedChangeHandler(value)
    }, [cachedValue])
  } else {
    useEffect(() => {
      debouncedChangeHandler(value)
    }, [value])
  }

  useEffect(() => () => debouncedChangeHandler.cancel(), [])

  return [value, setValue]
}

export function useDebouncedFnAsync<T>(fn: (v?: T) => Promise<void | unknown>, delay: number) {
  const debouncedFn = useRef(debounce(async (v?) => await fn(v), delay))

  return debouncedFn.current
}

export function useDebouncedFn<T>(fn: (v?: T) => void | unknown, delay: number) {
  const debouncedFn = useRef(debounce((v?) => fn(v), delay))

  return debouncedFn.current
}

export function useCachedState<T>(priorityState: T): [T, (v: T) => void, Dispatch<SetStateAction<T>>] {
  const [tempState, setTempState] = useState<T>(priorityState)

  useEffect(() => {
    setTempState(priorityState)
  }, [priorityState])
  return [tempState, setTempState, setTempState]
}

export function useDebouncedEffect(callbackFn: () => void, delay: number, deps?: unknown[]) {
  const debouncedFn = useRef(debounce(() => callbackFn(), delay))
  useEffect(() => {
    debouncedFn.current()
  }, deps ?? [])
}

export function useThrottledEffect(callbackFn: () => void, wait: number, deps?: unknown[]) {
  const throttledFn = useRef(throttle(() => callbackFn(), wait))
  useEffect(() => {
    throttledFn.current()
  }, deps ?? [])
}

export function useRefEffect<T>(
  initialValue: T,
  effectFn: (ref: MutableRefObject<T>, setRefValue: (newValue: T) => void) => void,
  deps?: DependencyList,
): [MutableRefObject<T>, (newRefValue: T) => void] {
  const refValue = useRef<T>(initialValue)
  const setRefValue = () => (newValue: T) => {
    refValue.current = newValue
  }

  useEffect(() => {
    effectFn(refValue, setRefValue)
  }, deps ?? [])

  return [refValue, setRefValue]
}

export function useEmptyRefEffect(
  effectFn: (ref: MutableRefObject<unknown>, setRefValue: (newValue: unknown) => void) => void,
  deps?: DependencyList,
): [MutableRefObject<unknown>, (newRefValue: unknown) => void] {
  const refValue = useRef<unknown>()
  const setRefValue = () => (newValue: unknown) => {
    refValue.current = newValue
  }

  useEffect(() => {
    effectFn(refValue, setRefValue)
  }, deps ?? [])

  return [refValue, setRefValue]
}

export function useRefTracked<T>(trackedValue: T): [MutableRefObject<T>, (newRefValue: T) => void] {
  const refValue = useRef<T>(trackedValue)
  const setRefValue = () => (newValue: T) => {
    refValue.current = newValue
  }

  useEffect(() => {
    refValue.current = trackedValue
  }, [trackedValue])

  return [refValue, setRefValue]
}

export function useDebouncedLayoutEffect(callbackFn: () => void, delay: number, deps?: unknown[]) {
  const debouncedFn = useRef(debounce(() => callbackFn(), delay))
  useLayoutEffect(() => {
    debouncedFn.current()
  }, deps ?? [])
}

export function useThrottledLayoutEffect(callbackFn: () => void, wait: number, deps?: unknown[]) {
  const throttledFn = useRef(throttle(() => callbackFn(), wait))
  useLayoutEffect(() => {
    throttledFn.current()
  }, deps ?? [])
}
