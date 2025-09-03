# FinBoard

FinBoard is a comprehensive, customizable financial dashboard built with a modern, full-stack TypeScript architecture. It provides users with real-time stock data, AI-generated news, and a flexible interface to monitor financial markets.

This document provides a detailed overview of the project's architecture, features, and technical implementation, serving as a guide for developers and stakeholders.

---

## 1. Core Technologies & Rationale

This project leverages a curated set of modern technologies chosen for performance, developer experience, and scalability.

| Technology          | Role & Rationale                                                                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js 15**      | **Framework**: The core of the application. The **App Router** is used for optimized, file-system-based routing. **Server Components** are used to reduce client-side JavaScript and improve initial load times by rendering on the server. |
| **React & TypeScript** | **UI & Type Safety**: React provides the component-based architecture for the UI. TypeScript is used throughout for strict type safety, reducing runtime errors and improving code maintainability. |
| **Tailwind CSS**    | **Styling**: A utility-first CSS framework for rapid, consistent, and maintainable styling. It's paired with `cn` (a `clsx` and `tailwind-merge` utility) for conditional class management. |
| **shadcn/ui**       | **Component Library**: Provides beautifully designed, accessible, and unstyled base components (like Cards, Buttons, Dialogs) that are customized using Tailwind CSS. |
| **Redux Toolkit**   | **Client-Side State**: Manages the state of the dashboard's widget layout. It provides a centralized store for widget configuration, which is essential for features like drag-and-drop and persistence. |
| **Genkit (by Firebase)** | **Generative AI**: A server-side framework for building AI-powered features. In this app, it's used to generate content for the "News" section by creating a **flow** that calls the Gemini model. |
| **Alpha Vantage API** | **Financial Data**: The primary source for real-time and historical stock market data. Server Actions (`getRealTimeData`, `getHistoricalData`) securely fetch data from this API. |
| **Recharts**        | **Data Visualization**: Used for creating the historical price charts and the portfolio allocation bar chart. It's a composable and powerful charting library for React. |
| **dnd-kit**         | **Drag and Drop**: Powers the customizable dashboard layout, allowing users to reorder widgets. It's a modern, lightweight, and accessible library for drag-and-drop interactions. |

---

## 2. Key Features Deep Dive

### a. Customizable Dashboard
The core feature is a dynamic grid-based dashboard where users can rearrange widgets to their liking.

- **Implementation**:
  - The layout is managed by the **Redux Toolkit** store (`widgetsSlice.ts`), which holds an array of widget configurations.
  - The `DndContext` from **`dnd-kit`** wraps the widget grid in `DashboardClient.tsx`.
  - `SortableContext` and the `useSortable` hook provide the drag-and-drop functionality.
  - When a drag operation ends (`onDragEnd`), the new widget order is dispatched to the Redux store.

### b. State Persistence in `localStorage`
The dashboard's state, including widget order, custom widgets, and theme preference, is saved to the browser's `localStorage`.

- **Implementation**:
  - **Widgets**: The Redux slice (`widgetsSlice.ts`) has a `getInitialState` function that attempts to load the widget configuration from `localStorage`. After any action that modifies the widgets (add, remove, reorder), the entire state is saved back to `localStorage`.
  - **Theme**: The `ThemeProvider` (`theme-provider.tsx`) from `next-themes` handles theme state and persistence automatically.

### c. Real-time & Historical Data
The application fetches and displays both real-time price updates and historical stock data.

- **Implementation**:
  - **Next.js Server Actions**: Data fetching is handled by Server Actions (`src/app/actions.ts` and `src/app/actions/get-historical-data.ts`). This is a crucial security and performance feature, as API keys and data fetching logic remain on the server, not exposed to the client.
  - **Rate Limiting Handling**: In `watchlist/client.tsx`, historical data is fetched sequentially with a 15-second delay between calls to avoid hitting the Alpha Vantage API's free-tier rate limit. This provides a more robust user experience than showing an error.

### d. AI-Powered News Generation
The News page features dynamically generated financial news articles, showcasing the integration of Generative AI.

- **Implementation**:
  - **Genkit Flow**: `src/ai/flows/generate-news.ts` defines an AI "flow".
  - **Prompt Engineering**: The flow contains a carefully crafted prompt that instructs the Gemini model to return data in a specific JSON format (defined by a Zod schema). This ensures the AI's output is structured and can be reliably parsed and displayed.
  - **Server Action Wrapper**: A server action (`getNews` in `components/news/actions.ts`) calls this Genkit flow, separating the AI logic from the client component.

### e. Add Custom Widgets
Users can create their own widgets by providing a public API endpoint.

- **Implementation**:
  - The `AddWidgetDialog` component collects the API URL, widget name, and other configuration.
  - It fetches data from the provided URL to allow the user to select which data fields to display.
  - The configuration is saved to the Redux store, and a generic `CustomWidget` component is rendered, which is responsible for fetching and displaying the data from the user-provided API.

### f. Configuration Import/Export
Users can save their dashboard layout to a JSON file and import it later.

- **Implementation**:
  - **Export**: The settings page (`settings/client.tsx`) reads the current widget state from Redux, converts it to a JSON string, and triggers a browser download.
  - **Import**: It uses a hidden file input. On file selection, a `FileReader` reads the JSON, which is then parsed and dispatched to the Redux store to update the layout.

---

## 3. Project Structure Overview

The project follows a standard Next.js App Router structure, with a clear separation of concerns.

```
/src
├── app/                  # Next.js App Router: Pages & Layouts
│   ├── (pages)/          # Route groups for each main section (dashboard, news, etc.)
│   │   └── page.tsx      # The main page component for each route
│   ├── actions.ts        # Core server actions (e.g., getRealTimeData)
│   ├── globals.css     # Global styles and Tailwind CSS layers
│   └── layout.tsx        # The root layout for the entire application
│
├── ai/                   # Genkit AI Functionality
│   ├── flows/            # Contains specific AI tasks (e.g., generate-news.ts)
│   └── genkit.ts         # Genkit initialization and configuration
│
├── components/           # Reusable React Components
│   ├── dashboard/        # Components specific to the main dashboard
│   ├── news/             # Components for the News page
│   ├── ui/               # Core UI components from shadcn/ui (Button, Card, etc.)
│   └── theme-provider.tsx # Logic for the light/dark theme toggle
│
├── hooks/                # Custom React hooks (e.g., use-toast)
│
├── lib/                  # Libraries, utilities, and core logic
│   ├── redux/            # Redux Toolkit state management
│   │   ├── slices/       # State slices (e.g., widgetsSlice.ts)
│   │   └── store.ts      # Redux store configuration
│   ├── types.ts          # Global TypeScript type definitions
│   └── utils.ts          # Utility functions (e.g., cn for classnames)
│
├── public/               # Static assets (images, fonts, etc.) - Not used in this project
│
└── tailwind.config.ts    # Tailwind CSS configuration
└── package.json          # Project dependencies and scripts
```
