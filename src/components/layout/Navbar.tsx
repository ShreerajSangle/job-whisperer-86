import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { QuickAddJobForm } from '@/components/jobs/QuickAddJobForm';
import { useAuth } from '@/hooks/useAuth';
import { Briefcase, LogOut, LayoutDashboard, BarChart3 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl hidden sm:block">JobTracker</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" asChild>
              <Link to="/dashboard">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/insights">
                <BarChart3 className="h-4 w-4 mr-2" />
                Insights
              </Link>
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <QuickAddJobForm />
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.email || '')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-0.5 leading-none">
                    <p className="font-medium text-sm">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
