import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MetaProvider } from './context/MetaContext';
import { Header, Footer } from './components/Header';
import { CatalogPage } from './pages/CatalogPage';
import { ProductPage } from './pages/ProductPage';

export function App() {
  return (
    <BrowserRouter>
      <MetaProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<CatalogPage />} />
              <Route path="/products/:slug" element={<ProductPage />} />
              <Route
                path="*"
                element={
                  <div className="mx-auto max-w-[640px] px-6 py-16 text-center">
                    <p className="font-display text-2xl font-bold text-ink">Page not found</p>
                    <a href="/" className="mt-4 inline-block text-sm font-medium text-clay">
                      Back to catalog
                    </a>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </MetaProvider>
    </BrowserRouter>
  );
}
