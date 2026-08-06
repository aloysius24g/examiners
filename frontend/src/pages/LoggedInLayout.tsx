import { useMediaQuery } from "react-responsive";
import { Outlet, useNavigate } from "react-router-dom";
import AppSidebar from "@/pages/AppSidebar";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { LogOut, Moon, Sun, User } from "lucide-react";
import { NavPopover } from "./NavPopover";
import { useUserContext } from "@/components/user-context";
import { useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

export default function LoggedInLayout() {

  const isMobile = useMediaQuery({ maxWidth: 767 });

  const {theme, setTheme} = useTheme();
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? 'light' : 'dark');
  }

  const navigate = useNavigate();

  const userContext = useUserContext();

  useEffect(() => {
    if(! userContext.data) {
      return;
    }

    const timer = new Date(userContext.data.expires).getTime() - Date.now()

    if(timer < 0) {
      navigate('/login/examiner');
      userContext.setData(null)
      return;
    }

    const timeoutId = setTimeout(() => {
      navigate('/login/examiner');
      userContext.setData(null)
    }, timer); // logout the user

    return () => clearTimeout(timeoutId); 

  }, [userContext.data, navigate])

  return (
    <div className="flex flex-col min-h-screen">
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-1">
          {isMobile && 
            <NavPopover />
          }
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
        <Popover>
          <PopoverTrigger className={`flex ${isMobile ? 'gap-1' : 'gap-2'} border px-2 py-1 rounded-(--radius)`}>
            <User size={20} />
            { ! isMobile && 
              <span>{userContext.data?.name}</span>
            }
          </PopoverTrigger>
          <PopoverContent className="flex flex-col">
            <span className="text-center">
              {userContext?.data ? `Logged in as ${userContext.data.name}` : 'Not Logged In'}
            </span>
            <Button
              variant='destructive'
              onClick={() => {
                toast.success('Logged out.');
                navigate('/login/examiner');
                userContext.setData(null);
              }}
            >
              <LogOut />
              Logout
            </Button>
          </PopoverContent>
        </Popover>
        </nav>
      </div>
    </header>
    <div className={`${isMobile === true ? '' : 'flex'} grow`}>
      {/* Sidebar */}

      {! isMobile && 
        <AppSidebar />
      }

      {/* Main content */}
      <main className="flex-1 p-6 bg-background">
        <Outlet />
      </main>
    </div>
    </div>
  );
}
