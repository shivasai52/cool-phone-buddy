import { useState, useEffect } from "react";
import { Thermometer, Zap, X, Sun, Smartphone, Battery, Wind, Moon, Wifi, Gamepad2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import logo from "@/assets/phone-temp-logo.png";

type TempStatus = "normal" | "warm" | "hot" | "dangerous" | "none";

interface Suggestion {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface StatusInfo {
  message: string;
  suggestions: Suggestion[];
  emoji: string;
  color: string;
  bgColor: string;
  gradient: string;
}

const getStatusInfo = (temp: number): StatusInfo => {
  if (temp <= 34) {
    return {
      message: "✅ Your phone temperature is perfect",
      suggestions: [
        {
          icon: <Thermometer className="w-5 h-5" />,
          title: "Optimal Temperature",
          description: "Your device is running perfectly. Continue your current usage habits!"
        },
        {
          icon: <Battery className="w-5 h-5" />,
          title: "Battery Health",
          description: "Great conditions for battery longevity and performance."
        },
        {
          icon: <Smartphone className="w-5 h-5" />,
          title: "Safe to Use",
          description: "All apps and features are safe to use without concerns."
        }
      ],
      emoji: "😊",
      color: "hsl(var(--temp-normal))",
      bgColor: "hsl(var(--temp-normal-bg))",
      gradient: "var(--gradient-normal)",
    };
  } else if (temp >= 35 && temp <= 44) {
    return {
      message: "⚠️ Your phone is getting warm",
      suggestions: [
        {
          icon: <X className="w-5 h-5" />,
          title: "Close Background Apps",
          description: "Swipe up and close unused apps running in the background."
        },
        {
          icon: <Sun className="w-5 h-5" />,
          title: "Reduce Brightness",
          description: "Lower screen brightness to 50% or enable auto-brightness."
        },
        {
          icon: <Wind className="w-5 h-5" />,
          title: "Improve Ventilation",
          description: "Remove phone case and avoid direct sunlight or hot surfaces."
        },
        {
          icon: <Wifi className="w-5 h-5" />,
          title: "Disable Unused Features",
          description: "Turn off Bluetooth, GPS, and mobile data when not needed."
        },
        {
          icon: <Moon className="w-5 h-5" />,
          title: "Take a Break",
          description: "Let your phone rest for 10-15 minutes to cool down naturally."
        }
      ],
      emoji: "😰",
      color: "hsl(var(--temp-warm))",
      bgColor: "hsl(var(--temp-warm-bg))",
      gradient: "var(--gradient-warm)",
    };
  } else if (temp >= 45 && temp <= 54) {
    return {
      message: "🚨 Your phone is overheating!",
      suggestions: [
        {
          icon: <Moon className="w-5 h-5" />,
          title: "🌙 Switch to Dark Mode",
          description: "Dark Mode reduces screen power consumption and heat generation significantly."
        },
        {
          icon: <Battery className="w-5 h-5" />,
          title: "Stop Charging NOW",
          description: "Immediately unplug your phone from the charger."
        },
        {
          icon: <Gamepad2 className="w-5 h-5" />,
          title: "Close Heavy Apps",
          description: "Exit games, video streaming, and camera apps immediately."
        },
        {
          icon: <Wifi className="w-5 h-5" />,
          title: "Enable Airplane Mode",
          description: "Turn on airplane mode to reduce processor load."
        },
        {
          icon: <Wind className="w-5 h-5" />,
          title: "Cool Environment",
          description: "Move to a cooler location, remove case, place on cool surface."
        },
        {
          icon: <Moon className="w-5 h-5" />,
          title: "Power Off Temporarily",
          description: "Consider turning off your phone for 15-20 minutes."
        },
        {
          icon: <AlertTriangle className="w-5 h-5" />,
          title: "Avoid Using",
          description: "Do not use your phone until temperature drops below 40°C."
        }
      ],
      emoji: "🔥",
      color: "hsl(var(--temp-hot))",
      bgColor: "hsl(var(--temp-hot-bg))",
      gradient: "var(--gradient-hot)",
    };
  } else {
    return {
      message: "☠️ Very high temperature! DANGER!",
      suggestions: [
        {
          icon: <Moon className="w-5 h-5" />,
          title: "🌙 Enable Dark Mode ASAP",
          description: "Switch to Dark Mode immediately to reduce power draw and screen heat!"
        },
        {
          icon: <AlertTriangle className="w-5 h-5" />,
          title: "CRITICAL: Stop ALL Activity",
          description: "Immediately stop using your phone. This is an emergency!"
        },
        {
          icon: <Battery className="w-5 h-5" />,
          title: "Unplug Immediately",
          description: "Remove from charger NOW. Do not attempt to charge."
        },
        {
          icon: <Smartphone className="w-5 h-5" />,
          title: "Power Off Device",
          description: "Turn off your phone completely and let it rest."
        },
        {
          icon: <Wind className="w-5 h-5" />,
          title: "Maximum Cooling",
          description: "Place in cool (NOT cold) environment. Remove all covers."
        },
        {
          icon: <AlertTriangle className="w-5 h-5" />,
          title: "Serious Risk",
          description: "Battery damage or fire risk. Do not use until fully cooled."
        },
        {
          icon: <Thermometer className="w-5 h-5" />,
          title: "Monitor Temperature",
          description: "Wait at least 30 minutes. Check temperature before using again."
        }
      ],
      emoji: "☠️",
      color: "hsl(var(--temp-dangerous))",
      bgColor: "hsl(var(--temp-dangerous-bg))",
      gradient: "var(--gradient-dangerous)",
    };
  }
};

export default function TemperatureChecker() {
  const [temperature, setTemperature] = useState<string>("");
  const [status, setStatus] = useState<TempStatus>("none");
  const [statusInfo, setStatusInfo] = useState<StatusInfo | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [batterySupported, setBatterySupported] = useState(true);
  const { theme, setTheme } = useTheme();

  const analyzeTemperature = (temp: number) => {
    const info = getStatusInfo(temp);
    setStatusInfo(info);

    if (temp <= 34) {
      setStatus("normal");
    } else if (temp >= 35 && temp <= 44) {
      setStatus("warm");
    } else if (temp >= 45 && temp <= 54) {
      setStatus("hot");
      // Auto-suggest dark mode when overheating
      if (theme !== "dark") {
        toast({
          title: "💡 Power Saving Tip",
          description: "Switch to Dark Mode to reduce screen heat and power consumption!",
          duration: 5000,
        });
      }
    } else {
      setStatus("dangerous");
      // Auto-suggest dark mode when critically hot
      if (theme !== "dark") {
        toast({
          title: "⚠️ URGENT: Enable Dark Mode!",
          description: "Dark Mode can help reduce heat by lowering screen power draw. Switch now!",
          variant: "destructive",
          duration: 8000,
        });
      }
    }
  };

  const handleCheck = () => {
    const temp = parseFloat(temperature);
    if (isNaN(temp)) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid temperature number.",
        variant: "destructive",
      });
      return;
    }
    analyzeTemperature(temp);
  };

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    
    try {
      // Check if Battery API is supported
      if (!('getBattery' in navigator)) {
        setBatterySupported(false);
        toast({
          title: "Auto-detection unavailable",
          description: "Your browser doesn't support automatic temperature detection. Please enter temperature manually.",
          variant: "destructive",
        });
        setIsDetecting(false);
        return;
      }

      const battery = await (navigator as any).getBattery();
      
      // Note: battery.temperature is not a standard property and rarely supported
      // We'll simulate or estimate based on charging status and level
      if (battery.temperature !== undefined) {
        const temp = battery.temperature;
        setTemperature(temp.toFixed(1));
        analyzeTemperature(temp);
        toast({
          title: "Temperature detected!",
          description: `Current temperature: ${temp.toFixed(1)}°C`,
        });
      } else {
        // Fallback: estimate based on charging status
        let estimatedTemp = 30; // Base temperature
        
        if (battery.charging) {
          estimatedTemp += 8; // Charging adds heat
        }
        
        if (battery.level < 0.2) {
          estimatedTemp += 3; // Low battery can mean heavy usage
        }
        
        toast({
          title: "Estimated temperature",
          description: `Your browser doesn't provide exact temperature. Estimated: ${estimatedTemp}°C based on battery status. For accurate results, please enter manually.`,
        });
        
        setTemperature(estimatedTemp.toString());
        analyzeTemperature(estimatedTemp);
      }
    } catch (error) {
      setBatterySupported(false);
      toast({
        title: "Detection failed",
        description: "Could not access battery information. Please enter temperature manually.",
        variant: "destructive",
      });
    }
    
    setIsDetecting(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCheck();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-float" />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl animate-pulse-glow" />
              <div className="relative bg-gradient-to-br from-card via-card to-primary/5 p-4 rounded-3xl border-2 border-primary/30 shadow-2xl backdrop-blur-sm">
                <img 
                  src={logo} 
                  alt="Phone Temperature Checker Logo" 
                  className="w-24 h-24 object-contain drop-shadow-2xl"
                />
                {status !== "none" && (
                  <div
                    className="absolute -top-2 -right-2 text-4xl animate-bounce drop-shadow-2xl"
                    style={{ animationDuration: "1s" }}
                  >
                    {statusInfo?.emoji}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">
              Phone Temperature Checker
            </h1>
            <p className="text-muted-foreground text-lg">
              Monitor your device health in real-time
            </p>
          </div>
        </div>

        {/* Input Card */}
        <Card className="p-6 space-y-4 border-2 shadow-2xl backdrop-blur-sm bg-card/80 hover:shadow-primary/10 transition-shadow duration-500">
          <div className="space-y-4">
            <div className="text-center">
              <Button
                onClick={handleAutoDetect}
                size="lg"
                className="w-full h-14 font-semibold text-base relative overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isDetecting}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-20 transition-opacity" />
                <Zap className={`mr-2 h-5 w-5 ${isDetecting ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
                <span className="relative z-10">
                  {isDetecting ? "Detecting..." : "Auto-Detect Temperature"}
                </span>
              </Button>
              <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Automatically detect battery temperature
              </p>
            </div>

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-4 text-muted-foreground text-sm">or enter manually</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <div className="space-y-2">
              <label htmlFor="temperature" className="text-sm font-medium text-foreground">
                Enter Temperature Manually
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="temperature"
                    type="number"
                    placeholder="e.g., 38"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="text-lg pr-12 h-12"
                    step="0.1"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    °C
                  </span>
                </div>
                <Button
                  onClick={handleCheck}
                  size="lg"
                  className="px-6 h-12 font-semibold"
                  disabled={!temperature}
                >
                  Check
                </Button>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 pt-2">
            <p className="font-medium">💡 How to find your phone temperature:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Check Settings → Battery → Battery Health (iOS)</li>
              <li>Check Settings → Device Care → Battery (Samsung)</li>
              <li>Use a CPU temperature monitoring app</li>
            </ul>
          </div>
        </Card>

        {/* Status Card */}
        {status !== "none" && statusInfo && (
          <Card
            className="p-6 border-2 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 backdrop-blur-sm relative overflow-hidden"
            style={{
              borderColor: statusInfo.color,
              background: `linear-gradient(135deg, ${statusInfo.bgColor}, hsl(var(--card)))`,
              boxShadow: `0 0 40px ${statusInfo.color}40, 0 20px 40px rgba(0,0,0,0.1)`,
            }}
          >
            {/* Animated gradient overlay */}
            <div 
              className="absolute inset-0 opacity-10 animate-gradient-shift bg-gradient-to-r from-transparent via-white to-transparent bg-[length:200%_100%]"
            />
            <div className="space-y-4 relative z-10">
              {/* Temperature Display */}
              <div className="text-center pb-6 border-b border-border/50">
                <div className="mb-4 flex justify-center">
                  <div className="relative">
                    <div 
                      className="absolute inset-0 rounded-full blur-2xl animate-pulse-glow"
                      style={{ backgroundColor: statusInfo.color, opacity: 0.3 }}
                    />
                    <div
                      className="relative text-7xl font-bold mb-2 bg-clip-text text-transparent drop-shadow-2xl animate-pulse-glow"
                      style={{ backgroundImage: statusInfo.gradient }}
                    >
                      {temperature}°C
                    </div>
                  </div>
                </div>
                
                {/* Temperature progress bar */}
                <div className="w-full h-3 bg-muted/30 rounded-full overflow-hidden mb-3 backdrop-blur-sm">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                    style={{
                      width: `${Math.min((parseFloat(temperature) / 60) * 100, 100)}%`,
                      background: statusInfo.gradient,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer bg-[length:200%_100%]" />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full animate-pulse"
                    style={{ 
                      backgroundColor: statusInfo.color,
                      boxShadow: `0 0 0 4px ${statusInfo.color}30`
                    }}
                  />
                  <p className="text-xl font-bold" style={{ color: statusInfo.color }}>
                    {statusInfo.message}
                  </p>
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-3">
                <p className="text-lg font-semibold text-foreground flex items-center gap-2">
                  💡 Cooling Tips
                </p>
                <div className="grid gap-3">
                  {statusInfo.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="group flex gap-3 p-4 rounded-xl bg-background/70 backdrop-blur-sm border border-border/50 hover:border-border hover:shadow-lg hover:scale-[1.02] transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 cursor-pointer relative overflow-hidden"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animationFillMode: 'backwards'
                      }}
                    >
                      {/* Hover gradient effect */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                        style={{ background: statusInfo.gradient }}
                      />
                      
                      <div
                        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 relative"
                        style={{ backgroundColor: statusInfo.bgColor }}
                      >
                        <div 
                          className="absolute inset-0 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: statusInfo.color }}
                        />
                        <div className="relative" style={{ color: statusInfo.color }}>
                          {suggestion.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 relative z-10">
                        <h4 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {suggestion.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
