import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PatientForm, PatientData } from "./PatientForm";
import { AgentCard } from "./AgentCard";
import { WorkflowVisualization } from "./WorkflowVisualization";
import { ResultsPanel } from "./ResultsPanel";
import { useToast } from "@/components/ui/use-toast";
import { 
  Activity, 
  Users, 
  FileText, 
  BarChart3,
  Play,
  RefreshCw
} from "lucide-react";
import { analyzePatientCase } from "@/integrations/ai/orchestrator";

interface Agent {
  id: string;
  name: string;
  specialty: string;
  description: string;
  status: "idle" | "working" | "completed" | "error";
  progress: number;
  findings: string[];
}

interface WorkflowStep {
  id: string;
  name: string;
  status: "pending" | "active" | "completed" | "error";
  progress: number;
  estimatedTime?: string;
  agentsInvolved: string[];
}

export const DiagnosticDashboard = () => {
  const { toast } = useToast();
  const [currentPatient, setCurrentPatient] = useState<PatientData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [workflowStep, setWorkflowStep] = useState<string>("idle");
  
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "literature",
      name: "Literature Agent",
      specialty: "Medical Research",
      description: "Searches medical literature and recent studies for relevant diagnostic information",
      status: "idle",
      progress: 0,
      findings: []
    },
    {
      id: "database",
      name: "Database Agent", 
      specialty: "Health Databases",
      description: "Scans medical databases and clinical guidelines for diagnostic criteria",
      status: "idle",
      progress: 0,
      findings: []
    },
    {
      id: "cases",
      name: "Case History Agent",
      specialty: "Historical Cases",
      description: "Reviews similar past cases and their outcomes for pattern recognition",
      status: "idle",
      progress: 0,
      findings: []
    },
    {
      id: "symptoms",
      name: "Symptom Analyzer",
      specialty: "Symptom Analysis",
      description: "Analyzes symptom patterns and correlations using AI diagnostic models",
      status: "idle",
      progress: 0,
      findings: []
    },
    {
      id: "patterns",
      name: "Pattern Recognition",
      specialty: "Data Analysis",
      description: "Identifies diagnostic patterns and provides confidence scoring",
      status: "idle",
      progress: 0,
      findings: []
    }
  ]);

  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    {
      id: "initialization",
      name: "Case Initialization",
      status: "pending",
      progress: 0,
      agentsInvolved: ["All Agents"]
    },
    {
      id: "data-gathering",
      name: "Data Gathering Phase",
      status: "pending", 
      progress: 0,
      estimatedTime: "~1 min",
      agentsInvolved: ["Literature Agent", "Database Agent", "Case History Agent"]
    },
    {
      id: "analysis",
      name: "Symptom Analysis",
      status: "pending",
      progress: 0,
      estimatedTime: "~1 min",
      agentsInvolved: ["Symptom Analyzer", "Pattern Recognition"]
    },
    {
      id: "synthesis",
      name: "Result Synthesis",
      status: "pending",
      progress: 0,
      estimatedTime: "~30 sec",
      agentsInvolved: ["All Agents"]
    },
    {
      id: "consensus",
      name: "Consensus Building",
      status: "pending", 
      progress: 0,
      estimatedTime: "~15 sec",
      agentsInvolved: ["Pattern Recognition"]
    }
  ]);

  const [results, setResults] = useState<any[]>([]);
  const [consensus, setConsensus] = useState<any>(null);

  const updateStep = (id: string, status: WorkflowStep["status"], progress: number) => {
    setWorkflowSteps(prev => prev.map(s => s.id === id ? { ...s, status, progress } : s));
  };

  const handlePatientSubmit = async (patientData: PatientData) => {
    setCurrentPatient(patientData);
    setIsProcessing(true);

    toast({
      title: "Analysis Started",
      description: `Running multi-agent analysis for patient ${patientData.patientId}`,
    });

    try {
      setWorkflowStep("initialization");
      updateStep("initialization", "active", 10);

      setWorkflowStep("data-gathering");
      updateStep("initialization", "completed", 100);
      updateStep("data-gathering", "active", 20);
      setAgents(prev => prev.map(a => ["literature","database","cases"].includes(a.id) ? { ...a, status: "working", progress: 10 } : a));

      setWorkflowStep("analysis");
      updateStep("data-gathering", "completed", 100);
      updateStep("analysis", "active", 30);
      setAgents(prev => prev.map(a => ["symptoms","patterns"].includes(a.id) ? { ...a, status: "working", progress: 10 } : a));

      // Run real orchestrator
      const out = await analyzePatientCase(patientData);

      // Fill agent findings and mark completed
      setAgents(prev => prev.map(a => {
        const f = (out.agentFindings as any)[a.id];
        return f ? { ...a, findings: f.findings, status: "completed", progress: 100 } : a;
      }));

      setWorkflowStep("synthesis");
      updateStep("analysis", "completed", 100);
      updateStep("synthesis", "active", 60);

      setResults(out.results);

      setWorkflowStep("consensus");
      updateStep("synthesis", "completed", 100);
      updateStep("consensus", "active", 80);

      setConsensus(out.consensus);

      updateStep("consensus", "completed", 100);
      setWorkflowStep("idle");

      toast({ title: "Analysis Complete", description: "Results and consensus are ready." });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Analysis failed", description: String(err?.message || err), variant: "destructive" as any });
      setAgents(prev => prev.map(a => ({ ...a, status: a.status === "idle" ? "idle" : "error" })));
    } finally {
      setIsProcessing(false);
    }
  };

  const overallProgress = workflowSteps.reduce((acc, step) => acc + step.progress, 0) / workflowSteps.length;
  const completedAgents = agents.filter(a => a.status === "completed").length;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-medical bg-clip-text text-transparent">
            Multi-Agent Diagnostic System
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced AI collaboration for comprehensive patient diagnosis and medical decision support
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="text-center p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">Active Agents</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {agents.filter(a => a.status === "working").length}
            </div>
          </Card>
          
          <Card className="text-center p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-medical-green" />
              <span className="font-medium">Completed</span>
            </div>
            <div className="text-2xl font-bold text-medical-green">
              {completedAgents}
            </div>
          </Card>
          
          <Card className="text-center p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-medical-orange" />
              <span className="font-medium">Cases Analyzed</span>
            </div>
            <div className="text-2xl font-bold text-medical-orange">
              {currentPatient ? "1" : "0"}
            </div>
          </Card>
          
          <Card className="text-center p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="font-medium">Progress</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {Math.round(overallProgress)}%
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Patient Form */}
          <div className="space-y-6">
            <PatientForm 
              onSubmit={handlePatientSubmit} 
              isProcessing={isProcessing}
            />
            
            {currentPatient && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Current Case
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Patient ID:</span>
                    <span>{currentPatient.patientId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Age:</span>
                    <span>{currentPatient.age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Priority:</span>
                    <Badge variant={currentPatient.urgency === "high" ? "destructive" : "secondary"}>
                      {currentPatient.urgency}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Symptoms:</span>
                    <span>{currentPatient.symptoms.length}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Middle Column - Agents */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">AI Agents</h2>
              {!isProcessing && completedAgents > 0 && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {agents.map((agent) => (
                <AgentCard key={agent.id} {...agent} />
              ))}
            </div>
          </div>
          
          {/* Right Column - Workflow & Results */}
          <div className="space-y-6">
            <WorkflowVisualization 
              steps={workflowSteps}
              overallProgress={overallProgress}
              currentStep={workflowStep}
            />
            
            {(results.length > 0 || consensus) && (
              <ResultsPanel 
                results={results}
                consensus={consensus}
                patient={currentPatient}
                agents={agents.map(a => ({ id: a.id, name: a.name, status: a.status, progress: a.progress }))}
                onExport={() => toast({ title: "Export", description: "Report exported successfully" })}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};