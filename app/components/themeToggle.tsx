
import { LuMoon, LuSun } from "react-icons/lu"
import { Theme, useTheme } from "remix-themes"



export function ThemeToggle() {
  const [theme, setTheme] = useTheme()

  const ThemeIcon = theme === Theme.DARK ? LuMoon : LuSun

  return (
    <button
      aria-label="Toggle theme"
      className="text-lg mb-2 rounded-xl px-4"
      onClick={() => setTheme(theme => (theme === Theme.DARK ? Theme.LIGHT : Theme.DARK))}
    >
      <ThemeIcon />
    </button>
  )
}
