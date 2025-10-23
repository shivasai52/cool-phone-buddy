import { useState, useEffect } from "react";
import { Thermometer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

type TempStatus = "normal" | "warm" | "hot" | "dangerous" | "none";

interface StatusInfo {
  message: string;
  suggestions: string;
  emoji: string;
  color: string;
  bgColor: string;
  gradient: string;
}

const getStatusInfo = (temp: number): StatusInfo => {
  if (temp <= 34) {
    return {
      message: "✅ Your phone temperature is perfect",
      suggestions: "Your device is running at an optimal temperature. Keep up the good usage habits!",
      emoji: "😊",
      color: "hsl(var(--temp-normal))",
      bgColor: "hsl(var(--temp-normal-bg))",
      gradient: "var(--gradient-normal)",
    };
  } else if (temp >= 35 && temp <= 44) {
    return {
      message: "⚠️ Your phone is getting warm",
      suggestions: "Try closing background apps, lower screen brightness, and avoid direct sunlight.",
      emoji: "😰",
      color: "hsl(var(--temp-warm))",
      bgColor: "hsl(var(--temp-warm-bg))",
      gradient: "var(--gradient-warm)",
    };
  } else if (temp >= 45 && temp <= 54) {
    return {
      message: "🚨 Your phone is overheating!",
      suggestions: "Stop charging immediately, close heavy apps, turn off mobile data, and let it cool down in a cooler environment.",
      emoji: "🔥",
      color: "hsl(var(--temp-hot))",
      bgColor: "hsl(var(--temp-hot-bg))",
      gradient: "var(--gradient-hot)",
    };
  } else {
    return {
      message: "☠️ Very high temperature! DANGER!",
      suggestions: "URGENT: Stop charging NOW! Turn off your phone and let it cool down completely. Do not use it until temperature normalizes.",
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

  const analyzeTemperature = (temp: number) => {
    const info = getStatusInfo(temp);
    setStatusInfo(info);

    if (temp <= 34) {
      setStatus("normal");
    } else if (temp >= 35 && temp <= 44) {
      setStatus("warm");
    } else if (temp >= 45 && temp <= 54) {
      setStatus("hot");
    } else {
      setStatus("dangerous");
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Thermometer className="w-16 h-16 text-primary" strokeWidth={1.5} />
              {status !== "none" && (
                <div
                  className="absolute -top-2 -right-2 text-3xl animate-bounce"
                  style={{ animationDuration: "1s" }}
                >
                  {statusInfo?.emoji}
                </div>
              )}
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Phone Temperature Checker</h1>
          <p className="text-muted-foreground">
            Check your phone's temperature and get helpful tips
          </p>
        </div>

        {/* Input Card */}
        <Card className="p-6 space-y-4 border-2 shadow-lg">
          <div className="space-y-4">
            <div className="text-center">
              <Button
                onClick={handleAutoDetect}
                size="lg"
                className="w-full h-14 font-semibold text-base"
                disabled={isDetecting}
              >
                <Zap className="mr-2 h-5 w-5" />
                {isDetecting ? "Detecting..." : "Auto-Detect Temperature"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
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
            className="p-6 border-2 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{
              borderColor: statusInfo.color,
              background: `linear-gradient(to bottom, ${statusInfo.bgColor}, hsl(var(--card)))`,
            }}
          >
            <div className="space-y-4">
              {/* Temperature Display */}
              <div className="text-center pb-4 border-b border-border">
                <div
                  className="text-6xl font-bold mb-2 bg-clip-text text-transparent"
                  style={{ backgroundImage: statusInfo.gradient }}
                >
                  {temperature}°C
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full animate-pulse"
                    style={{ backgroundColor: statusInfo.color }}
                  />
                  <p className="text-lg font-semibold" style={{ color: statusInfo.color }}>
                    {statusInfo.message}
                  </p>
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">💬 Suggestions:</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {statusInfo.suggestions}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
