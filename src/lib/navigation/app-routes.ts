import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Car,
  Gift,
  Map,
  MapPin,
  Route,
  Shield,
  Siren,
  Trophy,
  TrendingUp,
  Users,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

/** Typed TanStack route targets — always use these for navigation. */
export type AppRouteTarget =
  | { to: "/"; params?: undefined }
  | { to: "/login"; params?: undefined }
  | { to: "/signup"; params?: undefined }
  | { to: "/register"; params?: undefined }
  | { to: "/forgot-password"; params?: undefined }
  | { to: "/profile"; params?: undefined }
  | { to: "/settings"; params?: undefined }
  | { to: "/assistant"; params?: undefined }
  | { to: "/ai"; params?: undefined }
  | { to: "/ai/$module"; params: { module: string } }
  | { to: "/ride-tracker"; params?: undefined }
  | { to: "/trips"; params?: undefined }
  | { to: "/safety-score"; params?: undefined }
  | { to: "/driving-score"; params?: undefined }
  | { to: "/rewards"; params?: undefined }
  | { to: "/community"; params?: undefined }
  | { to: "/leaderboard"; params?: undefined }
  | { to: "/hazards"; params?: undefined }
  | { to: "/vehicles"; params?: undefined }
  | { to: "/history"; params?: undefined }
  | { to: "/reports"; params?: undefined }
  | { to: "/insurance"; params?: undefined }
  | { to: "/sos"; params?: undefined }
  | { to: "/emergency-sos"; params?: undefined }
  | { to: "/analytics"; params?: undefined }
  | { to: "/live-risk-map"; params?: undefined }
  | { to: "/safe-route-engine"; params?: undefined }
  | { to: "/features/$slug"; params: { slug: string } };

export type HomeFeatureCard = {
  title: string;
  icon: LucideIcon;
  color: string;
  route: AppRouteTarget;
};

export const HOME_FEATURE_GRID: HomeFeatureCard[] = [
  { title: "Ride Tracking", icon: Route, color: "text-electric", route: { to: "/ride-tracker" } },
  { title: "AI Assistant", icon: Bot, color: "text-success", route: { to: "/assistant" } },
  { title: "Safety Score", icon: TrendingUp, color: "text-safety", route: { to: "/safety-score" } },
  { title: "Emergency SOS", icon: Siren, color: "text-emergency", route: { to: "/emergency-sos" } },
  { title: "Safe Route Engine", icon: Map, color: "text-electric", route: { to: "/safe-route-engine" } },
  { title: "Road Hazard Reports", icon: AlertTriangle, color: "text-emergency", route: { to: "/hazards" } },
  { title: "Rewards", icon: Gift, color: "text-safety", route: { to: "/rewards" } },
  { title: "Vehicles", icon: Car, color: "text-electric", route: { to: "/vehicles" } },
  { title: "Community", icon: Users, color: "text-electric", route: { to: "/community" } },
  { title: "Insurance", icon: Shield, color: "text-electric", route: { to: "/insurance" } },
  { title: "Analytics", icon: BarChart3, color: "text-success", route: { to: "/analytics" } },
  { title: "Leaderboard", icon: Trophy, color: "text-safety", route: { to: "/leaderboard" } },
];

export const ASSISTANT_MODULES = [
  { slug: "safe-route", title: "Safe Route Engine", route: { to: "/safe-route-engine" } as const },
  { slug: "risk-prediction", title: "Risk Prediction", route: { to: "/live-risk-map" } as const },
  { slug: "driving-scorecard", title: "Driving Coach", route: { to: "/safety-score" } as const },
  { slug: "crash-detection", title: "Accident Prevention", route: { to: "/features/$slug", params: { slug: "crash-detection" } } as const },
  { slug: "insurance-telematics", title: "Insurance Assistant", route: { to: "/insurance" } as const },
  { slug: "vehicle-health", title: "Vehicle Health", route: { to: "/vehicles" } as const },
  { slug: "ai-chat", title: "AI Chat Assistant", route: { to: "/ai/$module", params: { module: "ai-chat" } } as const },
] as const;

export function featureRoute(slug: string): AppRouteTarget {
  return { to: "/features/$slug", params: { slug } };
}
