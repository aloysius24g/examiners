import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/components/user-context";
import { Moon, Sun } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";

export default function LoginLayout() {

  const userContext = useUserContext();

  const navigate = useNavigate()

  const {theme, setTheme} = useTheme();
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? 'light' : 'dark');
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-1">
            <div className="font-bold text-3xl text-blue-400">SXCCE</div>
            <div className="self-baseline font-bold text-xs mt-4">Examiners</div>
          </div>

          <nav className="flex items-center gap-6">
            <Button variant='ghost' onClick={toggleTheme}>
            { theme === 'dark' && <Sun /> }
            { theme === 'light' && <Moon /> }
            { theme === 'system' && (document.documentElement.classList.contains("dark") ?
              <Sun /> :
              <Moon />
            )}
            </Button>
            {userContext.data?.id &&
              <Button onClick={() => navigate(`/examiners/${userContext.data?.id}`)}>
                Profile
              </Button>
            }
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex flex-col grow justify-center">
        <Outlet />
      </main>
    </div>
  );
}
