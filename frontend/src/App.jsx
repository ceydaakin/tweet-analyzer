import Navbar from "./components/sections/Navbar";
import Hero from "./components/sections/Hero";
import Dashboard from "./components/sections/Dashboard";
import HowItWorks from "./components/sections/HowItWorks";
import Features from "./components/sections/Features";
import ApiSection from "./components/sections/ApiSection";
import Footer from "./components/sections/Footer";
import { useAnalysisHistory } from "./hooks/useAnalysisHistory";
import { useTheme } from "./hooks/useTheme";

function App() {
  const { theme, toggleTheme } = useTheme();
  const history = useAnalysisHistory();

  return (
    <>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Hero onAnalysisComplete={history.add} />
        <Dashboard items={history.items} stats={history.stats} onClear={history.clear} />
        <HowItWorks />
        <Features />
        <ApiSection />
      </main>
      <Footer />
    </>
  );
}

export default App;
