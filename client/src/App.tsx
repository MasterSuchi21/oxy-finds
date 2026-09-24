import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MetaProvider } from './context/MetaContext';
import { Header, Footer } from './components/Header';
import { CatalogPage } from './pages/CatalogPage';
import { ProductPage } from './pages/ProductPage';

function NotFound() {
  return (
    <div className="mx-auto max-w-[640px] px-6 py-24 text-center">
      <p className="font-mono text-sm text-mist">[ 404 ]</p>
      <p className="mt-3 font-display text-3xl font-bold text-frost">Route not found</p>
      <a href="/" className="btn-neon mt-8 no-underline">
        ← Back to catalog
      </a>
    </div>
  );
}

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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </MetaProvider>
    </BrowserRouter>
  );
}
