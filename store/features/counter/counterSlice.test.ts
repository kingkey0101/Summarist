import { describe, expect, it } from "vitest";
import counterReducer, {
  type CounterState,
  decrement,
  fetchIncrement,
  increment,
  incrementByAmount,
} from "./counterSlice";

const initialState: CounterState = { value: 0, status: "idle" };

describe("counter slice", () => {
  it("should return the initial state", () => {
    expect(
      counterReducer(undefined as unknown as CounterState, { type: "unknown" }),
    ).toEqual(initialState);
  });

  it("handles increment", () => {
    const next = counterReducer(initialState, increment());
    expect(next.value).toBe(1);
  });

  it("handles decrement", () => {
    const next = counterReducer({ value: 2, status: "idle" }, decrement());
    expect(next.value).toBe(1);
  });

  it("handles incrementByAmount", () => {
    const next = counterReducer(initialState, incrementByAmount(5));
    expect(next.value).toBe(5);
  });

  it("handles fetchIncrement.fulfilled", () => {
    const action = fetchIncrement.fulfilled(3, "requestId", 3);
    const next = counterReducer(initialState, action);
    expect(next.value).toBe(3);
    expect(next.status).toBe("idle");
  });

  it("handles fetchIncrement.pending and rejected", () => {
    const pending = counterReducer(
      initialState,
      fetchIncrement.pending("req", 1),
    );
    expect(pending.status).toBe("loading");

    const rejected = counterReducer(
      initialState,
      fetchIncrement.rejected(new Error("err"), "req", 1),
    );
    expect(rejected.status).toBe("failed");
  });
});
