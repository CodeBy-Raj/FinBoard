
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export interface PortfolioAsset {
  id: string;
  ticker: string;
  shares: number;
  purchasePrice: number;
}

interface PortfolioState {
  assets: PortfolioAsset[];
}

const PORTFOLIO_STORAGE_KEY = 'finboard.portfolio';

const getInitialState = (): PortfolioState => {
  try {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (Array.isArray(parsed.assets)) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.error("Could not load portfolio from localStorage", e);
  }
  // Default state with some example assets
  return {
    assets: [
      { id: '1', ticker: 'AAPL', shares: 10, purchasePrice: 150 },
      { id: '2', ticker: 'GOOGL', shares: 5, purchasePrice: 2800 },
      { id: '3', ticker: 'TSLA', shares: 15, purchasePrice: 250 },
    ],
  };
};

const initialState: PortfolioState = getInitialState();

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    addAsset: (state, action: PayloadAction<PortfolioAsset>) => {
      state.assets.push(action.payload);
      if (typeof window !== 'undefined') {
        localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(state));
      }
    },
    removeAsset: (state, action: PayloadAction<string>) => {
      state.assets = state.assets.filter(asset => asset.id !== action.payload);
      if (typeof window !== 'undefined') {
        localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(state));
      }
    },
    editAsset: (state, action: PayloadAction<PortfolioAsset>) => {
        const index = state.assets.findIndex(asset => asset.id === action.payload.id);
        if (index !== -1) {
            state.assets[index] = action.payload;
        }
        if (typeof window !== 'undefined') {
            localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(state));
        }
    }
  },
});

export const { addAsset, removeAsset, editAsset } = portfolioSlice.actions;

export const selectPortfolioAssets = (state: RootState) => state.portfolio.assets;

export default portfolioSlice.reducer;
