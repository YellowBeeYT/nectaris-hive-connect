import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') as 'beekeeper' | 'landowner' | null;
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'beekeeper' | 'landowner'>(roleParam || 'beekeeper');
  
  const { signUp, signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(role === 'beekeeper' ? '/beekeeper' : '/landowner');
    }
  }, [user, navigate, role]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password, role);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-honey-light/20 flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-4">
          <Logo size="lg" />
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {role === 'beekeeper' ? 'Cont Apicultor' : 'Cont Proprietar Teren'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {role === 'beekeeper' ? 'Găsește terenuri pentru stupii tăi' : 'Oferă teren pentru apicultori'}
            </p>
          </div>
        </div>

        <Card className="p-8">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-14">
              <TabsTrigger value="login" className="text-lg">Autentificare</TabsTrigger>
              <TabsTrigger value="signup" className="text-lg">Înregistrare</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-6 mt-6">
                <div className="space-y-3">
                  <Label htmlFor="login-email" className="text-lg">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="email@exemplu.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-14 text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="login-password" className="text-lg">Parolă</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-14 text-lg"
                  />
                </div>

                <Button type="submit" className="w-full h-14 text-lg" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Intră în cont
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-6 mt-6">
                <div className="space-y-3">
                  <Label htmlFor="signup-email" className="text-lg">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="email@exemplu.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-14 text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="signup-password" className="text-lg">Parolă</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-14 text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-lg">Sunt</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={role === 'beekeeper' ? 'default' : 'outline'}
                      onClick={() => setRole('beekeeper')}
                      className="h-14 text-lg"
                    >
                      Apicultor
                    </Button>
                    <Button
                      type="button"
                      variant={role === 'landowner' ? 'secondary' : 'outline'}
                      onClick={() => setRole('landowner')}
                      className={`h-14 text-lg ${role === 'landowner' ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}`}
                    >
                      Proprietar
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 text-lg" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Creează cont
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-lg h-12">
            Înapoi la pagina principală
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
