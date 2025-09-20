import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Activity,
  Target,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStep {
  id: string;
  name: string;
  status: "pending" | "active" | "completed" | "error";
  progress: number;
  estimatedTime?: string;
  agentsInvolved: string[];
}

interface WorkflowVisualizationProps {
  steps: WorkflowStep[];
  overallProgress: number;
  currentStep: string;
}

const statusConfig = {
  pending: {
    color: "bg-muted text-muted-foreground",
    icon: Clock,
    badge: "secondary"
  },
  active: {
    color: "bg-medical-orange text-white",
    icon: Activity,
    badge: "default"
  },
  completed: {
    color: "bg-medical-green text-white",
    icon: CheckCircle,
    badge: "default"
  },
  error: {
    color: "bg-destructive text-destructive-foreground",
    icon: AlertCircle,
    badge: "destructive"
  }
} as const;

export const WorkflowVisualization = ({ 
  steps, 
  overallProgress, 
  currentStep 
}: WorkflowVisualizationProps) => {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Multi-Agent Workflow
          </CardTitle>
          <Badge variant="outline" className="px-3">
            {Math.round(overallProgress)}% Complete
          </Badge>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const config = statusConfig[step.status];
            const StatusIcon = config.icon;
            const isLast = index === steps.length - 1;
            
            return (
              <div key={step.id} className="relative">
                <div className="flex items-center gap-4">
                  {/* Status Icon */}
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                    config.color,
                    step.status === "active" && "shadow-glow"
                  )}>
                    <StatusIcon className="h-5 w-5" />
                  </div>
                  
                  {/* Step Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={cn(
                        "font-medium",
                        step.id === currentStep && "text-primary"
                      )}>
                        {step.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {step.estimatedTime && step.status === "active" && (
                          <span className="text-xs text-muted-foreground">
                            ~{step.estimatedTime}
                          </span>
                        )}
                        <Badge variant={config.badge as any}>
                          {step.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Agents Involved */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {step.agentsInvolved.map((agent) => (
                        <Badge 
                          key={agent} 
                          variant="outline" 
                          className="text-xs px-1.5 py-0.5"
                        >
                          {agent}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Progress Bar for Active Steps */}
                    {step.status === "active" && step.progress > 0 && (
                      <div className="mt-2">
                        <Progress value={step.progress} className="h-1.5" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Connector Line */}
                {!isLast && (
                  <div className={cn(
                    "absolute left-5 top-10 w-0.5 h-6 transition-colors",
                    step.status === "completed" ? "bg-medical-green" : "bg-border"
                  )} />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Summary */}
        <div className="mt-6 p-4 bg-gradient-subtle rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Workflow Summary</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-medical-green">
                {steps.filter(s => s.status === "completed").length}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-medical-orange">
                {steps.filter(s => s.status === "active").length}
              </div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-muted-foreground">
                {steps.filter(s => s.status === "pending").length}
              </div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};