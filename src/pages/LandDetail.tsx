import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, Calendar, Loader2 } from "lucide-react";

const LandDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [land, setLand] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLandDetail();
  }, [id]);

  const fetchLandDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('land_listings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setLand(data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!land) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Teren negăsit</h1>
          <Button onClick={() => navigate(-1)} size="lg" className="h-14 text-lg">Înapoi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Logo />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="default" 
          size="lg"
          onClick={() => navigate(-1)} 
          className="mb-6 h-14 text-lg px-8"
        >
          <ArrowLeft className="h-6 w-6 mr-3" />
          Înapoi
        </Button>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{land.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                {land.location}
              </div>
            </div>

            {land.description && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Descriere</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{land.description}</p>
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold mb-3">Flori Disponibile</h2>
              <div className="flex flex-wrap gap-2">
                {land.flowers?.map((flower: string) => (
                  <Badge key={flower}>{flower}</Badge>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-6 border-t">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Suprafață</div>
                <div className="text-2xl font-bold">{land.space_hectares} ha</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Preț</div>
                <div className="text-2xl font-bold text-primary">{land.price_per_month} lei/lună</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Disponibil</div>
                <div className="flex flex-col gap-1 text-sm">
                  {land.available_from && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      De la: {new Date(land.available_from).toLocaleDateString('ro-RO')}
                    </div>
                  )}
                  {land.available_until && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Până la: {new Date(land.available_until).toLocaleDateString('ro-RO')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default LandDetail;
