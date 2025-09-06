import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/AuthProvider";
import { MainApp } from "@/components/MainApp";
import { ToastProvider as ToastProviderPrimitive, ToastViewport } from "@radix-ui/react-toast";
import { useToast } from "@/hooks/use-toast";

const queryClient = new QueryClient();

// Wrapper component to provide toast context
const ToastWrapper = ({ children }) => {
  const { toasts } = useToast();
  return (
    <ToastProviderPrimitive>
      {children}
      <Toaster />
      <Sonner />
      <ToastViewport />
    </ToastProviderPrimitive>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
      <TooltipProvider>
        <AuthProvider>
          <ToastWrapper>
            <MainApp />
          </ToastWrapper>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
