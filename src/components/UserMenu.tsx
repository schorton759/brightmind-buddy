
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "./UserAvatar";
import { Settings, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Profile } from "@/types/auth";

interface UserMenuProps {
  profile?: Profile | null;
  onChangeAgeGroup?: () => void;
}

export function UserMenu({ profile: propProfile, onChangeAgeGroup }: UserMenuProps = {}) {
  const { profile: contextProfile, user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Use the profile from props if provided, otherwise use the one from context
  const profile = propProfile || contextProfile;

  // Determine user type from either metadata or profile
  const isParent = 
    user?.user_metadata?.user_type === 'parent' || 
    profile?.user_type === 'parent';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleSettings = () => {
    if (isParent) {
      navigate('/parent-settings');
    } else {
      navigate('/profile');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <UserAvatar />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {isParent ? 'Parent Account' : 'Child Account'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettings}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        {!isParent && onChangeAgeGroup && (
          <DropdownMenuItem onClick={onChangeAgeGroup}>
            <User className="mr-2 h-4 w-4" />
            <span>Change Age Group</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
