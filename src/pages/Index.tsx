import TemperatureChecker from "@/components/TemperatureChecker";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <TemperatureChecker />
    </div>
  );
};

export default Index;
