import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LandCardProps {
  id: string;
  title: string;
  location: string;
  flowers: string[];
  space_hectares: number;
  price_per_month: number;
  image_url?: string;
  available_from?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const LandCard = ({
  id,
  title,
  location,
  flowers,
  space_hectares,
  price_per_month,
  image_url,
  available_from,
  isFavorite,
  onToggleFavorite,
}: LandCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover-lift cursor-pointer group">
      <div onClick={() => navigate(`/land/${id}`)}>
        <div className="relative h-48 bg-muted overflow-hidden">
          {image_url ? (
            <img src={image_url} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-smooth" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-honey-light to-honey flex items-center justify-center">
              <span className="text-4xl">🌸</span>
            </div>
          )}
          
          {onToggleFavorite && (
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-3 right-3 rounded-full opacity-90 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-primary text-primary' : ''}`} />
            </Button>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-bold text-lg mb-1">{title}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {location}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {flowers.slice(0, 3).map((flower) => (
              <Badge key={flower} variant="secondary" className="text-xs">
                {flower}
              </Badge>
            ))}
            {flowers.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{flowers.length - 3} more
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              <div className="text-sm text-muted-foreground">Space</div>
              <div className="font-semibold">{space_hectares} ha</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Price</div>
              <div className="font-semibold text-primary">${price_per_month}/mo</div>
            </div>
          </div>

          {available_from && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
              <Calendar className="h-4 w-4" />
              Available from {new Date(available_from).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
