import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export interface Widget {
  id: string;
  type: string;
  gridColumn?: string;
  config?: any; // Used for custom widgets
}

interface WidgetsState {
  widgets: Widget[];
}

const WIDGETS_STORAGE_KEY = 'finboard.widgets';

const getInitialState = (): WidgetsState => {
  try {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(WIDGETS_STORAGE_KEY);
      if (savedState) {
        // Basic validation to make sure we're not parsing junk
        const parsed = JSON.parse(savedState);
        if (Array.isArray(parsed.widgets)) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.error("Could not load widgets from localStorage", e);
  }
  // This is the default state if nothing is in localStorage or there's an error.
  return {
    widgets: [
      { id: 'financeCards-1', type: 'financeCards', gridColumn: 'lg:col-span-3' },
      { id: 'stockChart-1', type: 'stockChart', gridColumn: 'lg:col-span-2' },
      { id: 'stockTable-1', type: 'stockTable', gridColumn: 'lg:col-span-1' },
      { id: 'news-1', type: 'news', gridColumn: 'lg:col-span-3' },
    ],
  };
};

const initialState: WidgetsState = getInitialState();

const widgetsSlice = createSlice({
  name: 'widgets',
  initialState,
  reducers: {
    addWidget: (state, action: PayloadAction<Widget>) => {
      state.widgets.push(action.payload);
      if (typeof window !== 'undefined') {
        localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(state));
      }
    },
    removeWidget: (state, action: PayloadAction<string>) => {
      state.widgets = state.widgets.filter(widget => widget.id !== action.payload);
      if (typeof window !== 'undefined') {
        localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(state));
      }
    },
    setWidgets: (state, action: PayloadAction<Widget[]>) => {
        state.widgets = action.payload;
        if (typeof window !== 'undefined') {
          // The state object being saved should have the {widgets: [...]} structure
          localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify({ widgets: action.payload }));
        }
    }
  },
});

export const { addWidget, removeWidget, setWidgets } = widgetsSlice.actions;

export const selectWidgets = (state: RootState) => state.widgets.widgets;

export default widgetsSlice.reducer;
