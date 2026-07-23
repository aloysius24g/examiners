import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUserContext } from "@/components/user-context";

export function NavPopover() {
  const userContext = useUserContext();
  const links = [];
  if(userContext?.data?.accountType === 'TS') {
    links.push({
      to: `/examiners/${userContext.data.id}/`,
      label: 'Profile'
    });
  }
  if(userContext?.data?.accountType === 'NS') {
    links.push({
      to: `/examiners`,
      label: 'Examiners list'
    })
    if(userContext.data.roleName === 'coe') {
      links.push({
        to: `/register/officer`,
        label: 'Create Officer Account'
      })
    }
  }
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost">
          <Menu />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-50" side="bottom" align="start">
        <div className="space-y-2">
        {links.map((link) => (
          <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            cn(
              "block px-3 py-2 rounded-md text-sm",
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )
          }
          >
          {link.label}
          </NavLink>
        ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
