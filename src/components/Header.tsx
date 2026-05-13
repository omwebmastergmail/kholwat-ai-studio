import { Link } from "@tanstack/react-router";
import { BookOpen, LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header
      className="w-full text-primary-foreground"
      style={{ background: "var(--gradient-header)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-5">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight sm:text-xl">Kholwat MDTI 2026</h1>
            <p className="text-xs opacity-90 sm:text-sm">Majelis Dzikir Tasbih Indonesia</p>
          </div>
        </Link>
        {userEmail ? (
          <div className="flex items-center gap-2">
            <Link to="/admin">
              <Button size="sm" variant="secondary">
                Admin
              </Button>
            </Link>
            <Button size="sm" variant="secondary" onClick={logout}>
              <LogOut className="mr-1 h-4 w-4" /> Keluar
            </Button>
          </div>
        ) : (
          <Link to="/login">
            <Button size="sm" variant="secondary">
              <LogIn className="mr-1 h-4 w-4" /> Login
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
