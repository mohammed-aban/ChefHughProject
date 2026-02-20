import { useEffect, useState } from "react"
import './App.css'
import Header from './components/Header';
import Main from "./components/MainComponent";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    document.body.classList.toggle("theme-dark", isDarkMode)
    return () => document.body.classList.remove("theme-dark")
  }, [isDarkMode])

  function toggleTheme() {
    setIsDarkMode((prevMode) => !prevMode)
  }

  return (
    <div className={`app-shell ${isDarkMode ? "theme-dark" : ""}`}>
      <Header isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
      <Main />
    </div>
  )
}

export default App
