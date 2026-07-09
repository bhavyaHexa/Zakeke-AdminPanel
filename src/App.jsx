import { GLBSelector } from "./components/GLBSelector";
import { ColorChangeCategory } from "./components/ColorChange/ColorChangeCategory";
import { EnvironmentCategory } from "./components/EnvironmentChange/EnvironmentCategory";
import { ExportPackage } from "./components/ExportPackage";
import { ProductList } from "./components/ProductList";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            Hexacoder 3D Ingestion Tool
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Configure your 3D model, map materials, and generate Zakeke payloads.
          </p>
        </header>

        <main>
          {/* ── Existing products ─────────────────────────────────────── */}
          <ProductList />

          {/* ── Configure & upload new / edit ─────────────────────────── */}
          <GLBSelector />
          <ColorChangeCategory />
          <EnvironmentCategory />
          <ExportPackage />
        </main>
      </div>
    </div>
  );
}

export default App;
