import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUserContext } from "@/components/user-context";

export default function AppSidebar() {
  const userContext = useUserContext();
  const links = [];
  if(userContext?.data?.accountType === 'TS') {
    links.push({
      to: `/examiners/${userContext.data.id}`,
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
    <aside className="w-60 border-r p-4 space-y-2">
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
    </aside>
  );
}
