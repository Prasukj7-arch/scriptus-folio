import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FloatingBooks } from "@/components/FloatingBooks";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import BookDetails from "./pages/BookDetails";
import BookForm from "./pages/BookForm";
import Profile from "./pages/Profile";
import AllBooks from "./pages/AllBooks";
import MyBooks from "./pages/MyBooks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <FloatingBooks />
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/all-books" element={<AllBooks />} />
              <Route path="/my-books" element={<MyBooks />} />
              <Route path="/books/:id" element={<BookDetails />} />
              <Route path="/books/new" element={<BookForm />} />
              <Route path="/books/:id/edit" element={<BookForm />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
