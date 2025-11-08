import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Plus, User, Loader2, Clock, CheckCircle, XCircle, CalendarIcon, Upload, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { cn } from "@/lib/utils";

const AVAILABLE_FLOWERS = [
  "Salcâm", "Tei", "Rapiță", "Floarea-soarelui", "Trifoi",
  "Lavandă", "Mentă", "Coriandru", "Măr", "Păr", "Cireș",
  "Gutui", "Nuc", "Castan", "Alte flori"
];

const LandownerDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [lands, setLands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFlowers, setSelectedFlowers] = useState<string[]>([]);
  const [availableFrom, setAvailableFrom] = useState<Date>();
  const [availableUntil, setAvailableUntil] = useState<Date>();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    description: "",
    space_hectares: "",
    price_per_day: "",
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth?role=landowner');
      return;
    }
    fetchLands();
  }, [user, navigate]);

  const fetchLands = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('land_listings')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLands(data || []);
    } catch (error: any) {
      toast.error("Eroare la încărcarea terenurilor");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setImageFiles(prev => [...prev, ...newFiles]);

    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (!user) return [];
    
    const urls: string[] = [];
    
    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('land-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('land-images')
          .getPublicUrl(fileName);

        urls.push(data.publicUrl);
      } catch (error) {
        console.error('Eroare la încărcarea imaginii:', error);
        toast.error("Eroare la încărcarea unei imagini");
      }
    }
    
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUploading(true);

    try {
      const imageUrls = imageFiles.length > 0 ? await uploadImages(imageFiles) : [];

      const { error } = await supabase
        .from('land_listings')
        .insert({
          owner_id: user.id,
          title: formData.title,
          location: formData.location,
          description: formData.description || null,
          space_hectares: parseFloat(formData.space_hectares),
          price_per_day: parseFloat(formData.price_per_day),
          flowers: selectedFlowers,
          available_from: availableFrom?.toISOString().split('T')[0] || null,
          available_until: availableUntil?.toISOString().split('T')[0] || null,
          image_urls: imageUrls,
        });

      if (error) throw error;

      toast.success("Teren adăugat cu succes!");
      setDialogOpen(false);
      setFormData({ title: "", location: "", description: "", space_hectares: "", price_per_day: "" });
      setSelectedFlowers([]);
      setAvailableFrom(undefined);
      setAvailableUntil(undefined);
      setImageFiles([]);
      setImagePreviews([]);
      fetchLands();
    } catch (error: any) {
      toast.error("Eroare la adăugarea terenului");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Sigur doriți să ștergeți această listare?")) return;

    try {
      const { error } = await supabase
        .from('land_listings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Listare ștearsă cu succes!");
      fetchLands();
    } catch (error: any) {
      toast.error("Eroare la ștergerea listării");
    }
  };

  const toggleFlowerSelection = (flower: string) => {
    setSelectedFlowers(prev =>
      prev.includes(flower)
        ? prev.filter(f => f !== flower)
        : [...prev, flower]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'denied':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'denied':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      default:
        return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Verificat';
      case 'pending':
        return 'În așteptare';
      case 'denied':
        return 'Refuzat';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          
          <div className="flex items-center gap-4">
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Terenurile Mele</h1>
            <p className="text-muted-foreground">
              Gestionează terenurile tale disponibile pentru apicultori
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Adaugă Teren
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adaugă Teren Nou</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Titlu *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Locație *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="ex: Com. Fundulea, Jud. Călărași"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descriere</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Adaugă detalii despre teren..."
                    rows={4}
                    className="whitespace-pre-wrap"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Flori Disponibile *</Label>
                  <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_FLOWERS.map((flower) => (
                        <Badge
                          key={flower}
                          variant={selectedFlowers.includes(flower) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary/80"
                          onClick={() => toggleFlowerSelection(flower)}
                        >
                          {flower}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {selectedFlowers.length > 0 && (
                    <div className="text-sm text-muted-foreground mt-2">
                      Selectate: {selectedFlowers.join(", ")}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Imagini Teren (multiple)</Label>
                  <div className="flex flex-col gap-4">
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Click pentru a încărca imagini (multiple)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="space">Suprafață (hectare) *</Label>
                    <Input
                      id="space"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.space_hectares}
                      onChange={(e) => setFormData({ ...formData, space_hectares: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Preț (lei/zi) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="1"
                      min="0"
                      value={formData.price_per_day}
                      onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Disponibil de la</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !availableFrom && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {availableFrom ? format(availableFrom, "dd/MM/yyyy", { locale: ro }) : "Selectează data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={availableFrom}
                          onSelect={setAvailableFrom}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Disponibil până la</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !availableUntil && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {availableUntil ? format(availableUntil, "dd/MM/yyyy", { locale: ro }) : "Selectează data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={availableUntil}
                          onSelect={setAvailableUntil}
                          initialFocus
                          disabled={(date) => {
                            const minDate = availableFrom || new Date(new Date().setHours(0, 0, 0, 0));
                            return date < minDate;
                          }}
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={uploading || selectedFlowers.length === 0}>
                  {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {uploading ? "Se adaugă..." : "Adaugă Teren"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : lands.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-xl text-muted-foreground mb-4">
              Nu ai încă niciun teren listat
            </p>
            <p className="text-muted-foreground">
              Adaugă primul tău teren pentru a începe să primești oferte de la apicultori
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lands.map((land) => (
              <Card key={land.id} className="overflow-hidden hover-lift">
                {land.image_urls && land.image_urls.length > 0 && (
                  <img
                    src={land.image_urls[0]}
                    alt={land.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-xl mb-2">{land.title}</h3>
                    <p className="text-muted-foreground">{land.location}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusIcon(land.verification_status)}
                    <Badge className={getStatusColor(land.verification_status)}>
                      {getStatusText(land.verification_status)}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {land.flowers?.slice(0, 3).map((flower: string) => (
                      <Badge key={flower} variant="secondary">
                        {flower}
                      </Badge>
                    ))}
                    {land.flowers?.length > 3 && (
                      <Badge variant="secondary">
                        +{land.flowers.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-sm text-muted-foreground">Suprafață</div>
                      <div className="font-semibold">{land.space_hectares} ha</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Preț</div>
                      <div className="font-semibold text-primary">{land.price_per_day} lei/zi</div>
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    className="w-full gap-2"
                    onClick={() => handleDeleteListing(land.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Șterge Listarea
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default LandownerDashboard;
