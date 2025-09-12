import { GraduationCap, Users, Sparkles } from "lucide-react";

export const StudentCouncilLogo = ({ size = "default", showText = true, className = "" }) => {
  const sizes = {
    small: {
      container: "h-8 w-8",
      text: "text-sm font-semibold",
      icon: "h-4 w-4"
    },
    default: {
      container: "h-12 w-12",
      text: "text-lg font-bold",
      icon: "h-6 w-6"
    },
    large: {
      container: "h-16 w-16",
      text: "text-xl font-bold",
      icon: "h-8 w-8"
    },
    hero: {
      container: "h-24 w-24",
      text: "text-2xl font-bold",
      icon: "h-12 w-12"
    }
  };

  const currentSize = sizes[size] || sizes.default;

  return (
    <div className={`logo-container ${className}`}>
      {/* Logo Icon */}
      <div className={`${currentSize.container} bg-gradient-to-br from-primary via-primary/90 to-accent rounded-full flex items-center justify-center relative overflow-hidden`}>
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-full"></div>
        <div className="absolute top-1 right-1 w-2 h-2 bg-accent/30 rounded-full"></div>
        <div className="absolute bottom-1 left-1 w-1 h-1 bg-primary/40 rounded-full"></div>
        
        {/* Main icon */}
        <div className="relative z-10 flex items-center justify-center">
          <GraduationCap className={`${currentSize.icon} text-primary-foreground`} />
        </div>
      </div>

      {/* Text branding */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs font-medium tracking-wide">IIIT DELHI</span>
            <Sparkles className="h-3 w-3 text-primary" />
          </div>
          <span className={`sc-branding ${currentSize.text}`}>
            Student Council
          </span>
        </div>
      )}
    </div>
  );
};

export const CompactLogo = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-8 w-8 bg-gradient-to-br from-primary via-primary/90 to-accent rounded-lg flex items-center justify-center">
        <GraduationCap className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-xs text-muted-foreground font-medium">IIIT Delhi</span>
        <span className="text-sm font-bold text-primary">Student Council</span>
      </div>
    </div>
  );
};

export default StudentCouncilLogo;