import { configureStore } from '@reduxjs/toolkit';
import widgetsReducer from './slices/widgetsSlice';
import portfolioReducer from './slices/portfolioSlice';

export const store = configureStore({
  reducer: {
    widgets: widgetsReducer,
    portfolio: portfolioReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
