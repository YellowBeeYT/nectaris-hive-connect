import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Plus, User, MapPin, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const LandownerDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [lands, setLands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    flowers: "",
    space_hectares: "",
    price_per_month: "",
    available_from: "",
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
      toast.error("Failed to load your land listings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('land_listings')
        .insert({
          owner_id: user.id,
          title: formData.title,
          description: formData.description,
          location: formData.location,
          flowers: formData.flowers.split(',').map(f => f.trim()),
          space_hectares: parseFloat(formData.space_hectares),
          price_per_month: parseFloat(formData.price_per_month),
          available_from: formData.available_from,
        });

      if (error) throw error;

      toast.success("Land listing created! Pending verification.");
      setDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        location: "",
        flowers: "",
        space_hectares: "",
        price_per_month: "",
        available_from: "",
      });
      fetchLands();
    } catch (error: any) {
      toast.error("Failed to create listing");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-accent" />;
      case 'denied':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-primary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'denied':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/account')}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Land Listings</h1>
            <p className="text-muted-foreground">
              Manage your properties and track verification status
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Add New Land
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Land Listing</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="flowers">Flowers (comma-separated) *</Label>
                    <Input
                      id="flowers"
                      placeholder="Lavender, Sunflower, Clover"
                      value={formData.flowers}
                      onChange={(e) => setFormData({ ...formData, flowers: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="space">Space (hectares) *</Label>
                    <Input
                      id="space"
                      type="number"
                      step="0.01"
                      value={formData.space_hectares}
                      onChange={(e) => setFormData({ ...formData, space_hectares: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Month ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price_per_month}
                      onChange={(e) => setFormData({ ...formData, price_per_month: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="available_from">Available From</Label>
                  <Input
                    id="available_from"
                    type="date"
                    value={formData.available_from}
                    onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Create Listing
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Land Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : lands.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground mb-4">
              You haven't added any land listings yet
            </p>
            <Button onClick={() => setDialogOpen(true)} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Add Your First Land
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lands.map(land => (
              <Card key={land.id} className="p-6 hover-lift cursor-pointer" onClick={() => navigate(`/land/${land.id}`)}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-lg">{land.title}</h3>
                    <Badge className={`gap-1 ${getStatusColor(land.verification_status)}`}>
                      {getStatusIcon(land.verification_status)}
                      {land.verification_status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {land.location}
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Space</span>
                      <span className="font-semibold">{land.space_hectares} ha</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-semibold text-primary">${land.price_per_month}/mo</span>
                    </div>
                  </div>
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
