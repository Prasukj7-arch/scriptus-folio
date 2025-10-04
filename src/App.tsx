import { Toaster } from "sonner";
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

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
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
              <Route path="*" element={
                <div className="flex min-h-screen items-center justify-center bg-background">
                  <div className="text-center">
                    <h1 className="mb-4 text-4xl font-bold">404</h1>
                    <p className="mb-4 text-xl text-muted-foreground">Page not found</p>
                    <a href="/" className="text-primary underline hover:text-primary/80">
                      Return to Home
                    </a>
                  </div>
                </div>
              } />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
