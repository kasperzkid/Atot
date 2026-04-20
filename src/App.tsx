import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import FindUs from "./pages/FindUs";
import MenuDashboard from "./pages/MenuDashboard";
import StaffDashboard from "./pages/dashboard/StaffDashboard";
import AtotHotel from "./pages/AtotHotel";
import Heritage from "./pages/Heritage";
import BookingPage from "./pages/BookingPage";
import HotelDashboard from "./pages/dashboard/hotel/HotelDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppInner() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/menu' || location.pathname === '/hotel' || location.pathname === '/book' || location.pathname === '/heritage' || location.pathname === '/hotel-dashboard' || location.pathname.startsWith('/dashboard');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotel" element={<AtotHotel />} />
        <Route path="/heritage" element={<Heritage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/find-us" element={<FindUs />} />
        <Route path="/menu" element={<MenuDashboard />} />
        <Route path="/dashboard" element={<StaffDashboard />} />
        <Route path="/hotel-dashboard" element={<HotelDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AppInner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
