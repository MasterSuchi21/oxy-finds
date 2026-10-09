import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { MetaProvider } from './context/MetaContext';
import { Header, Footer } from './components/Header';
import { CatalogPage } from './pages/CatalogPage';
import { ProductPage } from './pages/ProductPage';
import { FAQPage } from './pages/FAQPage';
import { HowToPage } from './pages/HowToPage';
import { AdminPage } from './pages/AdminPage';
import { VisitTracker } from './components/VisitTracker';
import { Seo } from './components/Seo';

function NotFound() {
  return (
    <>
      <Seo
        title="Page Not Found | Oxy Finds"
        description="The page you requested could not be found on Oxy Finds."
        path={window.location.pathname}
        noindex
      />
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <p className="text-sm text-subtle">404</p>
        <p className="mt-2 font-display text-2xl font-bold text-frost">Page not found</p>
        <a href="/" className="btn-primary mt-6 no-underline">
          Back to catalog
        </a>
      </div>
    </>
  );
}

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);
  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <MetaProvider>
        <VisitTracker />
        <div className="page-mesh flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<CatalogPage />} />
              <Route path="/products/:slug" element={<ProductPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/how-to" element={<HowToPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </MetaProvider>
    </BrowserRouter>
  );
}
