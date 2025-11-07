import { Link } from "react-router-dom";
import logo from "@/assets/nectaris-logo-bee.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const Logo = ({ size = "md", showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const textSizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <Link to="/" className="flex items-center gap-3 transition-smooth hover:opacity-80">
      <img src={logo} alt="Nectaris Logo" className={sizeClasses[size]} />
      {showText && (
        <span className={`font-bold text-gradient-honey ${textSizeClasses[size]}`}>
          Nectaris
        </span>
      )}
    </Link>
  );
};
