import { debounce, throttle } from 'lodash';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, } from 'react';
import { useAsyncEffect } from 'use-async-effect';
export function useStateTracked(trackedValue) {
    const [state, setState] = useState(trackedValue);
    useEffect(() => {
        setState(trackedValue);
    }, [trackedValue]);
    return [state, setState];
}
export function useRandomState() {
    const [randomState, setRandomState] = useState(Math.random());
    const randomize = () => {
        setRandomState(Math.random() * randomState);
    };
    return { randomState, randomize };
}
export function useIntervalMemo(fn, interval) {
    const { randomState, randomize } = useRandomState();
    setInterval(() => randomize(), interval);
    const value = useMemo(fn, [randomState]);
    return value;
}
export function useAsyncDebouncedTrigger(asyncEffectCallback, delay) {
    const debouncedChangeHandler = useMemo(() => debounce(async (v) => await asyncEffectCallback(v), delay), []);
    useEffect(() => {
        return debouncedChangeHandler.cancel();
    }, []);
    return {
        trigger: debouncedChangeHandler,
    };
}
export function useDebouncedTrigger(effectCallback, delay) {
    const debouncedChangeHandler = useMemo(() => debounce((v) => effectCallback(v), delay), []);
    useEffect(() => () => debouncedChangeHandler.cancel(), []);
    return {
        trigger: debouncedChangeHandler,
    };
}
export function useAsyncDebouncedStateEffect(asyncEffectCallback, delay, initialValue, memo = false) {
    const [value, setValue] = useState(initialValue ?? null);
    const debouncedChangeHandler = useMemo(() => debounce(async (v) => await asyncEffectCallback(v), delay), []);
    if (memo) {
        const cachedValue = useMemo(() => value, [value]);
        useAsyncEffect(async () => await debouncedChangeHandler(value), [cachedValue]);
    }
    else {
        useAsyncEffect(async () => await debouncedChangeHandler(value), [value]);
    }
    useEffect(() => () => debouncedChangeHandler.cancel(), []);
    return [value, setValue];
}
export function useDebouncedStateEffect(effectCallback, delay, initialValue, memo = false) {
    const [value, setValue] = useState(initialValue ?? null);
    const debouncedChangeHandler = useMemo(() => debounce(v => effectCallback(v), delay), []);
    if (memo) {
        const cachedValue = useMemo(() => value, [value]);
        useEffect(() => {
            debouncedChangeHandler(value);
        }, [cachedValue]);
    }
    else {
        useEffect(() => {
            debouncedChangeHandler(value);
        }, [value]);
    }
    useEffect(() => () => debouncedChangeHandler.cancel(), []);
    return [value, setValue];
}
export function useDebouncedFnAsync(fn, delay) {
    const debouncedFn = useRef(debounce(async (v) => await fn(v), delay));
    return debouncedFn.current;
}
export function useDebouncedFn(fn, delay) {
    const debouncedFn = useRef(debounce((v) => fn(v), delay));
    return debouncedFn.current;
}
export function useCachedState(priorityState) {
    const [tempState, setTempState] = useState(priorityState);
    useEffect(() => {
        setTempState(priorityState);
    }, [priorityState]);
    return [tempState, setTempState, setTempState];
}
export function useDebouncedEffect(callbackFn, delay, deps) {
    const debouncedFn = useRef(debounce(() => callbackFn(), delay));
    useEffect(() => {
        debouncedFn.current();
    }, deps ?? []);
}
export function useThrottledEffect(callbackFn, wait, deps) {
    const throttledFn = useRef(throttle(() => callbackFn(), wait));
    useEffect(() => {
        throttledFn.current();
    }, deps ?? []);
}
export function useRefEffect(initialValue, effectFn, deps) {
    const refValue = useRef(initialValue);
    const setRefValue = () => (newValue) => {
        refValue.current = newValue;
    };
    useEffect(() => {
        effectFn(refValue, setRefValue);
    }, deps ?? []);
    return [refValue, setRefValue];
}
export function useEmptyRefEffect(effectFn, deps) {
    const refValue = useRef();
    const setRefValue = () => (newValue) => {
        refValue.current = newValue;
    };
    useEffect(() => {
        effectFn(refValue, setRefValue);
    }, deps ?? []);
    return [refValue, setRefValue];
}
export function useRefTracked(trackedValue) {
    const refValue = useRef(trackedValue);
    const setRefValue = () => (newValue) => {
        refValue.current = newValue;
    };
    useEffect(() => {
        refValue.current = trackedValue;
    }, [trackedValue]);
    return [refValue, setRefValue];
}
export function useDebouncedLayoutEffect(callbackFn, delay, deps) {
    const debouncedFn = useRef(debounce(() => callbackFn(), delay));
    useLayoutEffect(() => {
        debouncedFn.current();
    }, deps ?? []);
}
export function useThrottledLayoutEffect(callbackFn, wait, deps) {
    const throttledFn = useRef(throttle(() => callbackFn(), wait));
    useLayoutEffect(() => {
        throttledFn.current();
    }, deps ?? []);
}
//# sourceMappingURL=index.js.map