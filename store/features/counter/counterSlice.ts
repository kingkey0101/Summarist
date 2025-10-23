import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

export type CounterState = {
  value: number;
  status: "idle" | "loading" | "failed";
};

const initialState: CounterState = {
  value: 0,
  status: "idle",
};

// Simulated async increment (e.g. fetch)
export const fetchIncrement = createAsyncThunk<number, number | undefined>(
  "counter/fetchIncrement",
  async (amount = 1) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return amount;
  },
);

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment(state) {
      state.value += 1;
    },
    decrement(state) {
      state.value -= 1;
    },
    incrementByAmount(state, action: PayloadAction<number>) {
      state.value += action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncrement.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchIncrement.fulfilled, (state, action) => {
        state.status = "idle";
        state.value += action.payload;
      })
      .addCase(fetchIncrement.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
