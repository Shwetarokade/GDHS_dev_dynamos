import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Brain,
  Shield,
  Activity
} from "lucide-react";
import { generateDiagnosticPdfReport, downloadDiagnosticPdf } from "@/lib/report";
import { useCallback } from "react";

interface DiagnosticResult {
  condition: string;
  confidence: number;
  severity: "low" | "medium" | "high";
  evidence: string[];
  recommendations: string[];
  source: string;
}

interface ResultsPanelProps {
  results: DiagnosticResult[];
  consensus?: {
    primaryDiagnosis: string;
    confidence: number;
    alternativeDiagnoses: string[];
  };
  patient?: {
    patientId: string;
    age: number;
    gender: string;
    symptoms: string[];
    primaryComplaint: string;
    medicalHistory: string;
    currentMedications: string[];
    urgency: "low" | "medium" | "high";
  } | null;
  agents?: Array<{ id: string; name: string; status: string; progress: number; }>
  onExport?: () => void;
}

// ...existing code...
export const ResultsPanel = (props: ResultsPanelProps) => {
  const { results, consensus, patient, agents = [], onExport } = props;
  const [exporting, setExporting] = useState(false);
  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const doc = generateDiagnosticPdfReport({
        patient: patient || undefined,
        agents,
        results,
        consensus
      });
      downloadDiagnosticPdf("diagnostic_report", doc);
      if (onExport) onExport();
    } catch (err) {
      console.error("Report export failed", err);
      if (onExport) onExport();
    } finally {
      setExporting(false);
    }
  }, [results, consensus, onExport, agents, patient]);
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-destructive";
      case "medium": return "text-medical-orange";
      case "low": return "text-medical-green";
      default: return "text-muted-foreground";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Diagnostic Results
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    onClick={handleExport}
                    variant="default"
                    size="sm"
                    className="relative font-semibold bg-gradient-to-r from-primary to-medical-green text-white shadow-lg hover:from-medical-green hover:to-primary focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
                    disabled={exporting}
                  >
                    {exporting ? (
                      <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {exporting ? "Exporting..." : "Export Report"}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Export the diagnostic results as a PDF file
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="consensus" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="consensus" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Consensus
            </TabsTrigger>
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Individual Results
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Summary
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="consensus" className="space-y-4">
            {consensus ? (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-subtle rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Primary Diagnosis</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium">{consensus.primaryDiagnosis}</span>
                      <Badge variant="default" className="bg-primary">
                        {Math.round(consensus.confidence)}% Confidence
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${consensus.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                {consensus.alternativeDiagnoses.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Alternative Diagnoses</h4>
                    <div className="space-y-2">
                      {consensus.alternativeDiagnoses.map((diagnosis, index) => (
                        <div key={index} className="p-3 bg-muted/50 rounded-md">
                          <span className="text-sm">{diagnosis}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Consensus analysis in progress...</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="individual" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-4 pr-4">
                {results.map((result, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{result.condition}</CardTitle>
                          <p className="text-sm text-muted-foreground">Source: {result.source}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityBadge(result.severity)}>
                            {result.severity} severity
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(result.confidence)}%
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div>
                        <h5 className="font-medium text-sm mb-2">Evidence</h5>
                        <ul className="space-y-1">
                          {result.evidence.map((item, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-medical-green mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-sm mb-2">Recommendations</h5>
                        <ul className="space-y-1">
                          {result.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 text-medical-orange mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-primary mb-1">
                  {results.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Conditions Analyzed
                </div>
              </Card>
              
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-medical-green mb-1">
                  {results.filter(r => r.confidence >= 80).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  High Confidence
                </div>
              </Card>
              
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-destructive mb-1">
                  {results.filter(r => r.severity === "high").length}
                </div>
                <div className="text-sm text-muted-foreground">
                  High Severity
                </div>
              </Card>
            </div>
            
            <div className="p-4 bg-gradient-subtle rounded-lg border">
              <h4 className="font-medium mb-3">Analysis Summary</h4>
              <div className="space-y-2 text-sm">
                <p>• Comprehensive analysis completed by {results.length > 0 ? "multiple AI agents" : "diagnostic AI"}</p>
                <p>• Evidence gathered from medical literature, case histories, and symptom analysis</p>
                <p>• Results ranked by confidence level and clinical relevance</p>
                <p>• Recommendations provided for further investigation and treatment</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}