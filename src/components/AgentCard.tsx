import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Database, 
  FileSearch, 
  Stethoscope, 
  Activity,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  id: string;
  name: string;
  specialty: string;
  description: string;
  status: "idle" | "working" | "completed" | "error";
  progress: number;
  findings?: string[];
  onStart?: () => void;
  onView?: () => void;
}

const agentIcons = {
  "Literature Agent": FileSearch,
  "Database Agent": Database,
  "Case History Agent": Brain,
  "Symptom Analyzer": Stethoscope,
  "Pattern Recognition": Activity,
};

const statusConfig = {
  idle: {
    color: "bg-muted",
    textColor: "text-muted-foreground",
    icon: Clock,
    badge: "secondary"
  },
  working: {
    color: "bg-medical-orange",
    textColor: "text-warning-foreground",
    icon: Activity,
    badge: "default"
  },
  completed: {
    color: "bg-medical-green",
    textColor: "text-success-foreground",
    icon: CheckCircle,
    badge: "default"
  },
  error: {
    color: "bg-destructive",
    textColor: "text-destructive-foreground",
    icon: AlertCircle,
    badge: "destructive"
  }
} as const;

export const AgentCard = ({ 
  id, 
  name, 
  specialty, 
  description, 
  status, 
  progress, 
  findings = [],
  onStart,
  onView 
}: AgentCardProps) => {
  const AgentIcon = agentIcons[name as keyof typeof agentIcons] || Brain;
  const StatusIcon = statusConfig[status].icon;
  const config = statusConfig[status];

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-medical border-l-4",
      status === "working" && "border-l-medical-orange shadow-glow",
      status === "completed" && "border-l-medical-green",
      status === "error" && "border-l-destructive",
      status === "idle" && "border-l-muted"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              config.color
            )}>
              <AgentIcon className={cn("h-5 w-5", config.textColor)} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{name}</CardTitle>
              <p className="text-sm text-muted-foreground">{specialty}</p>
            </div>
          </div>
          <Badge variant={config.badge as any} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        
        {status === "working" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {findings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Key Findings:</h4>
            <ul className="space-y-1">
              {findings.slice(0, 3).map((finding, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-medical-green mt-0.5 flex-shrink-0" />
                  {finding}
                </li>
              ))}
            </ul>
            {findings.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{findings.length - 3} more findings
              </p>
            )}
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          {status === "idle" && onStart && (
            <Button size="sm" onClick={onStart} className="flex-1">
              Start Analysis
            </Button>
          )}
          {status === "completed" && onView && (
            <Button size="sm" variant="outline" onClick={onView} className="flex-1">
              View Results
            </Button>
          )}
          {status === "working" && (
            <Button size="sm" variant="outline" disabled className="flex-1">
              Processing...
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};