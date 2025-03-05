
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

interface UserAvatarProps {
  className?: string;
}

export function UserAvatar({ className }: UserAvatarProps) {
  const { profile } = useAuth();
  
  // Get initials from username
  const getInitials = () => {
    if (!profile?.username) return "?";
    return profile.username.charAt(0).toUpperCase();
  };

  return (
    <Avatar className={className}>
      {profile?.avatar_url ? (
        <AvatarImage src={profile.avatar_url} alt={profile.username} />
      ) : null}
      <AvatarFallback>{getInitials()}</AvatarFallback>
    </Avatar>
  );
}
