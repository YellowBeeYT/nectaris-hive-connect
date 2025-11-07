import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LandCard } from "@/components/LandCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Search, User, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AVAILABLE_FLOWERS = [
  "Salcâm", "Tei", "Rapiță", "Floarea-soarelui", "Trifoi",
  "Lavandă", "Mentă", "Coriandru", "Măr", "Păr", "Cireș",
  "Gutui", "Nuc", "Castan", "Alte flori"
];

const BeekeeperDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [lands, setLands] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [flowerFilter, setFlowerFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth?role=beekeeper');
      return;
    }
    fetchLands();
    fetchFavorites();
  }, [user, navigate]);

  const fetchLands = async () => {
    try {
      const { data, error } = await supabase
        .from('land_listings')
        .select('*')
        .eq('verification_status', 'verified')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLands(data || []);
    } catch (error: any) {
      toast.error("Eroare la încărcarea terenurilor");
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('land_id')
        .eq('beekeeper_id', user.id);

      if (error) throw error;
      setFavorites(new Set(data?.map(f => f.land_id) || []));
    } catch (error: any) {
      console.error("Eroare la încărcarea favoritelor");
    }
  };

  const toggleFavorite = async (landId: string) => {
    if (!user) return;

    try {
      if (favorites.has(landId)) {
        await supabase
          .from('favorites')
          .delete()
          .eq('beekeeper_id', user.id)
          .eq('land_id', landId);
        
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(landId);
          return newSet;
        });
        toast.success("Eliminat din favorite");
      } else {
        await supabase
          .from('favorites')
          .insert({ beekeeper_id: user.id, land_id: landId });
        
        setFavorites(prev => new Set(prev).add(landId));
        toast.success("Adăugat la favorite");
      }
    } catch (error: any) {
      toast.error("Eroare la actualizarea favoritelor");
    }
  };

  const filteredLands = lands.filter(land => {
    if (showFavorites && !favorites.has(land.id)) return false;
    if (searchQuery && !land.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (locationFilter && !land.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    if (flowerFilter !== "all" && !land.flowers?.includes(flowerFilter)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFavorites(!showFavorites)}
              className={showFavorites ? 'text-primary' : ''}
            >
              <Heart className={`h-5 w-5 ${showFavorites ? 'fill-primary' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/account')}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={signOut}>
              Deconectare
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {showFavorites ? 'Favoritele Tale' : 'Găsește Teren Perfect pentru Stupii Tăi'}
          </h1>
          <p className="text-muted-foreground">
            {showFavorites 
              ? 'Navighează prin locațiile salvate'
              : 'Caută și filtrează locații verificate pentru stupină'
            }
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Caută după titlu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              placeholder="Filtrează după locație..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-64"
            />
          </div>

          <div className="flex gap-4">
            <Select value={flowerFilter} onValueChange={setFlowerFilter}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filtrează după flori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate Florile</SelectItem>
                {AVAILABLE_FLOWERS.map(flower => (
                  <SelectItem key={flower} value={flower}>{flower}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredLands.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              {showFavorites ? 'Nu ai favorite încă' : 'Nu s-au găsit terenuri'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLands.map(land => (
              <LandCard
                key={land.id}
                {...land}
                isFavorite={favorites.has(land.id)}
                onToggleFavorite={() => toggleFavorite(land.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BeekeeperDashboard;
