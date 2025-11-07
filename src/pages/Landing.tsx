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
      <header className="container mx-auto py-6 px-4">
        <Logo size="lg" />
      </header>

      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Conectăm{" "}
              <span className="text-gradient-honey">Apicultorii</span> cu
              Terenuri Perfecte
            </h1>
            <p className="text-xl text-muted-foreground">
              Găsește locații ideale pentru stupii tăi sau oferă terenul tău pentru apicultori.
              Alătură-te Nectaris și ajută polenizatorii să prospere.
            </p>
          </div>
          
          <div className="relative">
            <img 
              src={heroImage}
              alt="Peisaj frumos cu flori"
              className="rounded-3xl shadow-2xl hover-lift"
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-primary/20 to-transparent" />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Alege-ți Calea</h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="p-8 hover-lift cursor-pointer transition-smooth group bg-card border-2 hover:border-primary hexagon-pattern"
                onClick={() => navigate('/auth?role=beekeeper')}>
            <div className="space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                <Flower className="w-10 h-10 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Sunt Apicultor</h3>
                <p className="text-muted-foreground">
                  Caută locații perfecte pentru stupină. Filtrează după flori, spațiu și locație.
                </p>
              </div>
              
              <Button size="lg" className="w-full group-hover:shadow-lg transition-smooth">
                Începe ca Apicultor
              </Button>
              
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Caută terenuri verificate
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Salvează favorite și urmărește disponibilitatea
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Sistem simplu de rezervare
                </li>
              </ul>
            </div>
          </Card>

          <Card className="p-8 hover-lift cursor-pointer transition-smooth group bg-card border-2 hover:border-accent hexagon-pattern"
                onClick={() => navigate('/auth?role=landowner')}>
            <div className="space-y-6">
              <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center group-hover:bg-accent/20 transition-smooth">
                <Users className="w-10 h-10 text-accent" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Sunt Proprietar</h3>
                <p className="text-muted-foreground">
                  Listează terenul tău și conectează-te cu apicultori responsabili. Câștigă venituri susținând natura.
                </p>
              </div>
              
              <Button size="lg" variant="secondary" className="w-full group-hover:shadow-lg transition-smooth bg-accent text-accent-foreground hover:bg-accent/90">
                Începe ca Proprietar
              </Button>
              
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Listează multiple proprietăți
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Urmărește statusul verificării
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Gestionează rezervările ușor
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </section>

      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="text-center text-muted-foreground">
          <p>© 2025 Nectaris. Susținem apicultorii și proprietarii de terenuri împreună.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
