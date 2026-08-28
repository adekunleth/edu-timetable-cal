import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ClassesProvider } from "./contexts/ClassesContext";
import { FiltersProvider } from "./contexts/FiltersContext";
import { RoleProvider } from "./contexts/RoleContext";
import Dashboard from "./pages/Dashboard";
import CalendarView from "./pages/CalendarView";
import ClassCreationForm from "./pages/ClassCreationForm";
import Subjects from "./pages/Subjects";
import Attendance from "./pages/Attendance";
import Cohorts from "./pages/Cohorts";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ClassesProvider>
        <FiltersProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/calendar/add-class" element={<ClassCreationForm />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/cohorts" element={<Cohorts />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
        </FiltersProvider>
      </ClassesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
