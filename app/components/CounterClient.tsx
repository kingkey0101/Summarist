"use client";

import {
  decrement,
  fetchIncrement,
  increment,
} from "../../store/features/counter/counterSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

export default function CounterClient() {
  const dispatch = useAppDispatch();
  const value = useAppSelector((s) => s.counter.value);
  const status = useAppSelector((s) => s.counter.status);

  return (
    <div>
      <div>Counter: {value}</div>
      <div>Status: {status}</div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button type="button" onClick={() => dispatch(decrement())}>
          -
        </button>
        <button type="button" onClick={() => dispatch(increment())}>
          +
        </button>
        <button type="button" onClick={() => dispatch(fetchIncrement(5))}>
          Fetch +5
        </button>
      </div>
    </div>
  );
}
