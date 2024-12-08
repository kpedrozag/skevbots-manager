import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BotsManager from "@/components/BotsManager";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BotsManager />
    </QueryClientProvider>
  );
}

export default App;
