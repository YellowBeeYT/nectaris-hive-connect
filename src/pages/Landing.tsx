import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Flower, Users } from "lucide-react";
import heroImage from "@/assets/hero-landscape.jpg";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-honey-light/20">
      {/* Header */}
      <header className="container mx-auto py-6 px-4">
        <Logo size="lg" />
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Connecting{" "}
              <span className="text-gradient-honey">Beekeepers</span> with
              Perfect Land
            </h1>
            <p className="text-xl text-muted-foreground">
              Find the ideal locations for your hives or share your land with beekeepers.
              Join Nectaris and help pollinators thrive.
            </p>
          </div>
          
          <div className="relative">
            <img 
              src={heroImage}
              alt="Beautiful flower meadow landscape"
              className="rounded-3xl shadow-2xl hover-lift"
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-primary/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Choose Your Path</h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Beekeeper Card */}
          <Card className="p-8 hover-lift cursor-pointer transition-smooth group bg-card border-2 hover:border-primary"
                onClick={() => navigate('/auth?role=beekeeper')}>
            <div className="space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                <Flower className="w-10 h-10 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">I'm a Beekeeper</h3>
                <p className="text-muted-foreground">
                  Search for perfect locations to place your hives. Filter by flowers, space, and location.
                </p>
              </div>
              
              <Button size="lg" className="w-full group-hover:shadow-lg transition-smooth">
                Get Started as Beekeeper
              </Button>
              
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Search verified land listings
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Save favorites and track availability
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Easy booking system
                </li>
              </ul>
            </div>
          </Card>

          {/* Landowner Card */}
          <Card className="p-8 hover-lift cursor-pointer transition-smooth group bg-card border-2 hover:border-accent"
                onClick={() => navigate('/auth?role=landowner')}>
            <div className="space-y-6">
              <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center group-hover:bg-accent/20 transition-smooth">
                <Users className="w-10 h-10 text-accent" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">I'm a Landowner</h3>
                <p className="text-muted-foreground">
                  List your land and connect with responsible beekeepers. Earn income while supporting nature.
                </p>
              </div>
              
              <Button size="lg" variant="secondary" className="w-full group-hover:shadow-lg transition-smooth bg-accent text-accent-foreground hover:bg-accent/90">
                Get Started as Landowner
              </Button>
              
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  List multiple properties
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Track verification status
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Manage bookings easily
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="text-center text-muted-foreground">
          <p>© 2025 Nectaris. Supporting beekeepers and landowners together.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
