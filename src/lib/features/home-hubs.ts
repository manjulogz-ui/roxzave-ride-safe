import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  Ambulance,
  BarChart3,
  Bot,
  Car,
  Droplets,
  Eye,
  Fuel,
  Gauge,
  GraduationCap,
  HeartPulse,
  Hospital,
  Map,
  MapPin,
  Mic,
  Receipt,
  Scale,
  Shield,
  ShieldAlert,
  Siren,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export type HubCard = {
  title: string;
  subtitle: string;
  to: string;
  params?: Record<string, string>;
  icon: LucideIcon;
  color: string;
};

export type ProductHub = {
  id: string;
  title: string;
  cards: HubCard[];
};

export const PRODUCT_HUBS: ProductHub[] = [
  {
    id: "ai-safety",
    title: "AI Safety Hub",
    cards: [
      { title: "Drowsiness Detection", subtitle: "Live monitor", to: "/features/$slug", params: { slug: "drowsiness-detection" }, icon: Eye, color: "text-electric" },
      { title: "Crash Detection", subtitle: "Impact alerts", to: "/features/$slug", params: { slug: "crash-detection" }, icon: AlertTriangle, color: "text-emergency" },
      { title: "Golden Hour SOS", subtitle: "Critical response", to: "/sos", icon: HeartPulse, color: "text-emergency" },
      { title: "Trauma Assistant", subtitle: "First aid AI", to: "/features/$slug", params: { slug: "trauma-assistant" }, icon: HeartPulse, color: "text-success" },
      { title: "Pothole Detection", subtitle: "Road hazards", to: "/features/$slug", params: { slug: "pothole-detection" }, icon: Activity, color: "text-safety" },
      { title: "AI Road Quality", subtitle: "Surface score", to: "/features/$slug", params: { slug: "road-quality" }, icon: Zap, color: "text-success" },
    ],
  },
  {
    id: "navigation",
    title: "Smart Navigation Hub",
    cards: [
      { title: "Safe Route Engine", subtitle: "Safety-first routing", to: "/features/$slug", params: { slug: "safe-route" }, icon: Map, color: "text-electric" },
      { title: "Fuel Prediction", subtitle: "Trip cost estimate", to: "/features/$slug", params: { slug: "fuel-cost" }, icon: Fuel, color: "text-electric" },
      { title: "Petrol Intelligence", subtitle: "Nearby stations", to: "/petrol", icon: Fuel, color: "text-electric" },
      { title: "Toll Intelligence", subtitle: "FASTag estimate", to: "/features/$slug", params: { slug: "toll-intelligence" }, icon: Receipt, color: "text-safety" },
      { title: "Traffic Law Engine", subtitle: "Rules & fines", to: "/features/$slug", params: { slug: "traffic-law" }, icon: Scale, color: "text-safety" },
    ],
  },
  {
    id: "women-safety",
    title: "Women Safety Hub",
    cards: [
      { title: "Women Safety Shield", subtitle: "Panic & evidence", to: "/women-safety", icon: ShieldAlert, color: "text-safety" },
      { title: "Women Safe Route", subtitle: "Crime-aware paths", to: "/features/$slug", params: { slug: "women-safe-route" }, icon: Map, color: "text-electric" },
      { title: "Guardian Tracking", subtitle: "Family live share", to: "/guardian", icon: Users, color: "text-electric" },
      { title: "Voice Distress", subtitle: "Keyword SOS", to: "/voice-distress", icon: Mic, color: "text-emergency" },
    ],
  },
  {
    id: "vehicle",
    title: "Vehicle Intelligence Hub",
    cards: [
      { title: "Driving Scorecard", subtitle: "Weekly analytics", to: "/driving-score", icon: TrendingUp, color: "text-success" },
      { title: "Insurance Telematics", subtitle: "Risk assessment", to: "/features/$slug", params: { slug: "insurance-telematics" }, icon: Shield, color: "text-electric" },
      { title: "Vehicle Health", subtitle: "Fleet status", to: "/vehicles", icon: Car, color: "text-safety" },
      { title: "BLE Devices", subtitle: "ESP32 telemetry", to: "/devices", icon: Gauge, color: "text-electric" },
    ],
  },
  {
    id: "emergency",
    title: "Emergency Hub",
    cards: [
      { title: "Emergency Network", subtitle: "Hospitals & trauma", to: "/features/$slug", params: { slug: "emergency-network" }, icon: Hospital, color: "text-emergency" },
      { title: "Ambulance Locator", subtitle: "Nearest units", to: "/features/$slug", params: { slug: "emergency-network" }, icon: Ambulance, color: "text-emergency" },
      { title: "Hospital Finder", subtitle: "Trauma centers", to: "/features/$slug", params: { slug: "emergency-network" }, icon: HeartPulse, color: "text-emergency" },
      { title: "Blood Bank Finder", subtitle: "Availability", to: "/features/$slug", params: { slug: "emergency-network" }, icon: Droplets, color: "text-emergency" },
    ],
  },
  {
    id: "community",
    title: "Community Hub",
    cards: [
      { title: "Road Watch", subtitle: "Community feed", to: "/community", icon: Users, color: "text-electric" },
      { title: "Road Reports", subtitle: "Submit hazards", to: "/reports", icon: MapPin, color: "text-safety" },
      { title: "Hazard Reports", subtitle: "Potholes & risks", to: "/features/$slug", params: { slug: "pothole-detection" }, icon: AlertTriangle, color: "text-emergency" },
      { title: "Safety Feed", subtitle: "Alerts near you", to: "/notifications", icon: Siren, color: "text-safety" },
    ],
  },
];

export const QUICK_LINKS = [
  { to: "/trips" as const, label: "Trip Center", icon: Map },
  { to: "/assistant" as const, label: "AI Copilot", icon: Bot },
  { to: "/features" as const, label: "All Features", icon: BarChart3 },
  { to: "/system" as const, label: "System Health", icon: Gauge },
  { to: "/features/$slug" as const, params: { slug: "school-safety" }, label: "School Safety", icon: GraduationCap },
];
