import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoggedInLayout from "@/pages/LoggedInLayout";
import LoginLayout from "./pages/LoginLayout";
import RegisterExaminer from "./pages/RegisterExaminer";
import { ThemeProvider } from "./components/theme-provider";
import { ExaminerLoginPage, OfficerLoginPage } from "./pages/Login";
import { Toaster } from "@/components/ui/sonner";
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Examiner from "./pages/Examiner";
import RegisterOfficer from "./pages/RegisterOfficer";
import ExaminersList from "./pages/ExaminersList";
import { queryClient } from "./lib/queryClient";
import { UserContextProvider } from "./components/user-context";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system">
    <QueryClientProvider client={queryClient}>
    <UserContextProvider>
    <Toaster
      position="bottom-right"
      swipeDirections={['right', 'bottom']}
    />
    <ReactQueryDevtools />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoggedInLayout />} />

        <Route path="/register" element={<LoginLayout />} >
          <Route path="examiner" element={<RegisterExaminer />}>
          </Route>
        </Route>

        <Route path="/register/officer" element={<LoggedInLayout />}>
          <Route index element={<RegisterOfficer />} />
        </Route>

        <Route path="/login" element={<LoginLayout />} >
          <Route path="examiner" element={<ExaminerLoginPage />}>
          </Route>
          <Route path="officer" element={<OfficerLoginPage />}>
          </Route>
        </Route>

        <Route path="/examiners" element={<LoggedInLayout />} >
          <Route index element={<ExaminersList />}>
          </Route>
          <Route path=":id" element={<Examiner />}>
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
    </UserContextProvider>
    </QueryClientProvider>
    </ThemeProvider>
  );
}
