import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  Bot,
  Car,
  Eye,
  Fuel,
  GraduationCap,
  HeartPulse,
  Map,
  Mic,
  Shield,
  ShieldAlert,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export type FeatureModule = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  color: string;
  category: "safety" | "ai" | "intelligence" | "emergency";
};

export const PRD_FEATURES: FeatureModule[] = [
  { slug: "drowsiness-detection", title: "Drowsiness Detection", subtitle: "ESP32 + AI", description: "Monitors driver alertness via device sensors and camera cues.", icon: Eye, color: "text-electric", category: "safety" },
  { slug: "crash-detection", title: "Auto Crash Detection", subtitle: "MPU6050", description: "Detects impact events and triggers Golden Hour SOS automatically.", icon: AlertTriangle, color: "text-emergency", category: "emergency" },
  { slug: "golden-hour-sos", title: "Golden Hour SOS", subtitle: "Emergency", description: "Critical first-hour trauma response coordination.", icon: HeartPulse, color: "text-emergency", category: "emergency" },
  { slug: "trauma-assistant", title: "Trauma Assistant", subtitle: "AI Medical", description: "Step-by-step trauma guidance until help arrives.", icon: HeartPulse, color: "text-success", category: "emergency" },
  { slug: "pothole-detection", title: "Pothole Detection", subtitle: "Crowd + Device", description: "Report and avoid pothole clusters on your route.", icon: Activity, color: "text-safety", category: "safety" },
  { slug: "safe-route", title: "Safe Route Engine", subtitle: "AI Routing", description: "Optimizes routes for safety score, not just speed.", icon: Map, color: "text-electric", category: "ai" },
  { slug: "fuel-cost", title: "Fuel Cost Prediction", subtitle: "Trip Intel", description: "Estimate fuel spend from distance, mileage, and live prices.", icon: Fuel, color: "text-electric", category: "intelligence" },
  { slug: "petrol-intelligence", title: "Petrol Bunk Intelligence", subtitle: "Nearby", description: "Find fuel stations with prices, ratings, and EV charging.", icon: Fuel, color: "text-electric", category: "intelligence" },
  { slug: "toll-intelligence", title: "Toll Intelligence", subtitle: "FASTag", description: "Toll plaza fees and optimal toll-aware routing.", icon: Car, color: "text-safety", category: "intelligence" },
  { slug: "traffic-law", title: "Traffic Law Engine", subtitle: "Compliance", description: "Real-time traffic rule alerts for your corridor.", icon: Shield, color: "text-safety", category: "safety" },
  { slug: "voice-copilot", title: "Voice Co-Pilot", subtitle: "Hands-free", description: "Voice commands for navigation and safety actions.", icon: Mic, color: "text-success", category: "ai" },
  { slug: "driving-scorecard", title: "Driving Scorecard", subtitle: "Analytics", description: "Trip-by-trip driving behavior scoring.", icon: TrendingUp, color: "text-success", category: "safety" },
  { slug: "insurance-telematics", title: "Insurance Telematics", subtitle: "Insurer AI", description: "Usage-based insurance insights from your trips.", icon: Shield, color: "text-electric", category: "ai" },
  { slug: "emergency-network", title: "Emergency Network Map", subtitle: "Hospitals", description: "Hospitals, blood banks, and trauma centers nearby.", icon: HeartPulse, color: "text-emergency", category: "emergency" },
  { slug: "school-safety", title: "School Safety", subtitle: "Zones", description: "School zone speed limits and child safety alerts.", icon: GraduationCap, color: "text-safety", category: "safety" },
  { slug: "women-safety", title: "Women Safety Shield", subtitle: "Protection", description: "Live tracking, recording, and safe corridor routing.", icon: ShieldAlert, color: "text-safety", category: "emergency" },
  { slug: "women-safe-route", title: "Women Safe Route", subtitle: "AI Route", description: "Routes weighted for lighting, crime, and patrol density.", icon: Map, color: "text-electric", category: "ai" },
  { slug: "guardian-tracking", title: "Guardian Tracking", subtitle: "Family", description: "Share live location with guardians in real time.", icon: Users, color: "text-electric", category: "safety" },
  { slug: "voice-distress", title: "Voice Distress", subtitle: "SOS Voice", description: "Voice-activated emergency trigger and evidence capture.", icon: Mic, color: "text-emergency", category: "emergency" },
  { slug: "road-quality", title: "AI Road Quality Score", subtitle: "Surface AI", description: "AI-scored road surface quality along your route.", icon: Zap, color: "text-success", category: "ai" },
];

export const AI_MODULES = [
  { slug: "safe-route", title: "Safe Route AI", icon: Map },
  { slug: "crash-prediction", title: "Crash Prediction AI", icon: AlertTriangle },
  { slug: "voice-copilot", title: "Voice Copilot", icon: Mic },
  { slug: "school-safety", title: "School Safety AI", icon: GraduationCap },
  { slug: "women-safety", title: "Women Safety AI", icon: ShieldAlert },
  { slug: "insurance-telematics", title: "Insurance AI", icon: Shield },
  { slug: "trauma-assistant", title: "Trauma Assistant", icon: HeartPulse },
  { slug: "fleet-analytics", title: "Fleet Analytics", icon: Bot },
] as const;

export function getFeature(slug: string): FeatureModule | undefined {
  return PRD_FEATURES.find((f) => f.slug === slug);
}
