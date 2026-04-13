import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./src/App.jsx";
import useAuthStore from "./src/store/auth.store";

// QueryClient is the cache manager for React Query
// All useQuery/useMutation calls share this single cache
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't retry failed requests by default
      // (avoids hammering backend on auth errors)
      retry: 1,
      // Data stays fresh for 30 seconds before background refetch
      staleTime: 30 * 1000,
    },
  },
});

// Rehydrate user from localStorage on app load
// So page refresh doesn't lose the logged-in state
useAuthStore.getState().rehydrate();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* QueryClientProvider makes React Query available to all components */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
