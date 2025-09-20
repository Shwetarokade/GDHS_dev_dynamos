import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, FileText, Plus, X } from "lucide-react";

interface PatientFormProps {
  onSubmit: (data: PatientData) => void;
  isProcessing?: boolean;
}

export interface PatientData {
  patientId: string;
  age: number;
  gender: string;
  symptoms: string[];
  primaryComplaint: string;
  medicalHistory: string;
  currentMedications: string[];
  urgency: "low" | "medium" | "high";
}

export const PatientForm = ({ onSubmit, isProcessing = false }: PatientFormProps) => {
  const [formData, setFormData] = useState<PatientData>({
    patientId: "",
    age: 0,
    gender: "",
    symptoms: [],
    primaryComplaint: "",
    medicalHistory: "",
    currentMedications: [],
    urgency: "medium"
  });

  const [newSymptom, setNewSymptom] = useState("");
  const [newMedication, setNewMedication] = useState("");

  const addSymptom = () => {
    if (newSymptom.trim() && !formData.symptoms.includes(newSymptom.trim())) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, newSymptom.trim()]
      }));
      setNewSymptom("");
    }
  };

  const removeSymptom = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(s => s !== symptom)
    }));
  };

  const addMedication = () => {
    if (newMedication.trim() && !formData.currentMedications.includes(newMedication.trim())) {
      setFormData(prev => ({
        ...prev,
        currentMedications: [...prev.currentMedications, newMedication.trim()]
      }));
      setNewMedication("");
    }
  };

  const removeMedication = (medication: string) => {
    setFormData(prev => ({
      ...prev,
      currentMedications: prev.currentMedications.filter(m => m !== medication)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const urgencyColors = {
    low: "bg-medical-green",
    medium: "bg-medical-orange", 
    high: "bg-destructive"
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Patient Case Input
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                value={formData.patientId}
                onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                placeholder="P-2024-001"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                placeholder="35"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryComplaint">Primary Complaint</Label>
            <Textarea
              id="primaryComplaint"
              value={formData.primaryComplaint}
              onChange={(e) => setFormData(prev => ({ ...prev, primaryComplaint: e.target.value }))}
              placeholder="Describe the main reason for the consultation..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Symptoms</Label>
            <div className="flex gap-2">
              <Input
                value={newSymptom}
                onChange={(e) => setNewSymptom(e.target.value)}
                placeholder="Add a symptom"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSymptom())}
              />
              <Button type="button" onClick={addSymptom} size="icon" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.symptoms.map((symptom) => (
                <Badge key={symptom} variant="secondary" className="flex items-center gap-1">
                  {symptom}
                  <button
                    type="button"
                    onClick={() => removeSymptom(symptom)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea
              id="medicalHistory"
              value={formData.medicalHistory}
              onChange={(e) => setFormData(prev => ({ ...prev, medicalHistory: e.target.value }))}
              placeholder="Previous diagnoses, surgeries, family history..."
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Current Medications</Label>
            <div className="flex gap-2">
              <Input
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                placeholder="Add a medication"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addMedication())}
              />
              <Button type="button" onClick={addMedication} size="icon" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.currentMedications.map((medication) => (
                <Badge key={medication} variant="secondary" className="flex items-center gap-1">
                  {medication}
                  <button
                    type="button"
                    onClick={() => removeMedication(medication)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Case Urgency</Label>
            <Select value={formData.urgency} onValueChange={(value: any) => setFormData(prev => ({ ...prev, urgency: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-medical-green"></div>
                    Low Priority
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-medical-orange"></div>
                    Medium Priority
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-destructive"></div>
                    High Priority
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isProcessing}
            size="lg"
          >
            <FileText className="h-4 w-4 mr-2" />
            {isProcessing ? "Initializing Diagnostic Workflow..." : "Start Multi-Agent Analysis"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};