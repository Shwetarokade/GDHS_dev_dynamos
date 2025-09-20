import jsPDF from "jspdf";

// Optional: Add a simple watermark/logo function
const addWatermark = (doc: jsPDF, pageWidth: number, pageHeight: number) => {
  doc.saveGraphicsState();
  doc.setFontSize(60);
  // Make watermark even fainter (alpha 0.03)
  doc.setTextColor(30, 64, 175, 0.03); // Blue, ultra faint
  doc.text("MedsAI", pageWidth / 2, pageHeight / 2, { align: "center", angle: 30 });
  doc.restoreGraphicsState();
};

export interface ReportPatientData {
  patientId: string;
  age: number;
  gender: string;
  symptoms: string[];
  primaryComplaint: string;
  medicalHistory: string;
  currentMedications: string[];
  urgency: "low" | "medium" | "high";
}

export interface ReportResultItem {
  condition: string;
  confidence: number;
  severity: "low" | "medium" | "high";
  evidence: string[];
  recommendations: string[];
  source: string;
}

export interface ReportConsensus {
  primaryDiagnosis: string;
  confidence: number;
  alternativeDiagnoses: string[];
}

// Color scheme for the PDF
const COLORS = {
  primary: '#1e40af',      // Blue
  secondary: '#64748b',    // Slate
  success: '#059669',      // Green
  warning: '#d97706',      // Orange
  danger: '#dc2626',       // Red
  light: '#f8fafc',        // Light gray
  dark: '#1e293b',        // Dark slate
  border: '#e2e8f0'        // Light border
};


// Enhanced section divider with gradient effect
const addSectionDivider = (doc: jsPDF, x: number, y: number, width: number) => {
  // Simulate a gradient by drawing several lines with varying opacity
  for (let i = 0; i < 6; i++) {
    const alpha = 0.15 + 0.12 * (5 - i);
    doc.setDrawColor(30, 64, 175, alpha * 255);
    doc.setLineWidth(1.5 - i * 0.2);
    doc.line(x, y + i, x + width, y + i);
  }
};

const addStyledHeader = (doc: jsPDF, text: string, x: number, y: number, color: string = COLORS.primary) => {
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(color);
  doc.text(text, x, y);
  addSectionDivider(doc, x, y + 6, 495);
  return y + 30;
};

const addStyledSubheader = (doc: jsPDF, text: string, x: number, y: number) => {
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.dark);
  doc.text(text, x, y);
  return y + 20;
};

const addStyledLine = (doc: jsPDF, x: number, y: number, width: number, color: string = COLORS.border) => {
  doc.setDrawColor(color);
  doc.setLineWidth(1);
  doc.line(x, y, x + width, y);
};

const addStyledText = (doc: jsPDF, text: string, x: number, y: number, fontSize: number = 11, color: string = COLORS.dark) => {
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(color);
  // Ensure text is converted to string and handle long text properly
  const textStr = typeof text === 'string' ? text : String(text);
  const lines = doc.splitTextToSize(textStr, 515);
  doc.text(lines, x, y);
  // Improved line height calculation to prevent text overlap
  const lineHeight = fontSize * 1.2;
  return y + lines.length * lineHeight + 8;
};

const addColoredBox = (doc: jsPDF, x: number, y: number, width: number, height: number, color: string) => {
  try {
    doc.setFillColor(color);
    doc.rect(x, y, width, height, 'F');
  } catch (error) {
    // Fallback to default color if color parsing fails
    doc.setFillColor(COLORS.secondary);
    doc.rect(x, y, width, height, 'F');
  }
};

const addSeverityIndicator = (doc: jsPDF, severity: string, x: number, y: number) => {
  let color: string;
  switch (severity) {
    case "high": color = COLORS.danger; break;
    case "medium": color = COLORS.warning; break;
    case "low": color = COLORS.success; break;
    default: color = COLORS.secondary;
  }
  addColoredBox(doc, x, y, 8, 8, color);
  return x + 12;
};

// Helper function to check if we need a page break
const checkPageBreak = (doc: jsPDF, y: number, requiredSpace: number = 50) => {
  const pageHeight = 842;
  const margin = 50;
  if (y + requiredSpace > pageHeight - margin) {
    doc.addPage();
    return 50; // Return new Y position
  }
  return y;
};

export function generateDiagnosticPdfReport(params: {
  patient?: ReportPatientData | null;
  agents?: Array<{ id: string; name: string; status: string; progress: number; }>; 
  results: ReportResultItem[];
  consensus?: ReportConsensus | null;
}): jsPDF {
  const { patient, agents = [], results, consensus } = params;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const left = 50;
  const right = 550;
  const pageWidth = 595;
  const pageHeight = 842;

  // --- COVER PAGE ---
  addColoredBox(doc, 0, 0, pageWidth, pageHeight, COLORS.light);
  doc.setFontSize(38);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.primary);
  doc.text("MedsAI Diagnostic Report", pageWidth / 2, 180, { align: "center" });
  doc.setFontSize(18);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.secondary);
  doc.text("Comprehensive AI-Driven Medical Analysis", pageWidth / 2, 220, { align: "center" });
  doc.setFontSize(13);
  doc.setTextColor(COLORS.dark);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 260, { align: "center" });
  // Optional: Add watermark/logo
  addWatermark(doc, pageWidth, pageHeight);
  // Add a bottom divider
  addSectionDivider(doc, left, pageHeight - 80, right - left);
  doc.setFontSize(11);
  doc.setTextColor(COLORS.secondary);
  doc.text("Generated by MedsAI Diagnostic System", pageWidth / 2, pageHeight - 60, { align: "center" });
  doc.addPage();

  // --- MAIN CONTENT ---
  let y = 50;
  // Add watermark to every page
  addWatermark(doc, pageWidth, pageHeight);

  // Patient Information Section with enhanced styling
  if (patient) {
    y = addStyledHeader(doc, "Patient Information", left, y);
    // Add background for patient info section
    addColoredBox(doc, left - 10, y - 20, right - left + 20, 120, COLORS.light);
    // Patient ID with enhanced styling
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.dark);
    doc.text("Patient ID:", left, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.secondary);
    doc.text(patient.patientId, left + 80, y);
    // Demographics in a more organized layout
    y += 20;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.dark);
    doc.text("Demographics:", left, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.secondary);
    doc.text(`Age: ${patient.age} | Gender: ${patient.gender} | Urgency: ${patient.urgency.toUpperCase()}`, left + 80, y);
    // Urgency indicator as colored circle
    let urgencyColor = COLORS.secondary;
    switch (patient.urgency) {
      case "high": urgencyColor = COLORS.danger; break;
      case "medium": urgencyColor = COLORS.warning; break;
      case "low": urgencyColor = COLORS.success; break;
    }
    doc.setFillColor(urgencyColor);
    doc.circle(right - 40, y - 4, 7, 'F');
    doc.setFontSize(10);
    doc.setTextColor(COLORS.light);
    doc.text(patient.urgency.charAt(0).toUpperCase(), right - 42.5, y - 1);
    doc.setTextColor(COLORS.secondary);
    y += 25;
    // Primary complaint with better formatting
    if (patient.primaryComplaint) {
      y = addStyledSubheader(doc, "Primary Complaint", left, y);
      y = addStyledText(doc, patient.primaryComplaint, left, y, 11, COLORS.dark);
    }
    // Symptoms with bullet points
    if (patient.symptoms?.length) {
      y = addStyledSubheader(doc, "Symptoms", left, y);
      patient.symptoms.forEach(symptom => {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(COLORS.dark);
        const symptomText = typeof symptom === 'string' ? symptom : String(symptom);
        const lines = doc.splitTextToSize("• " + symptomText, 505);
        doc.text(lines, left + 10, y);
        y += lines.length * 13 + 4;
      });
    }
    // Medications with better formatting
    if (patient.currentMedications?.length) {
      y = addStyledSubheader(doc, "Current Medications", left, y);
      patient.currentMedications.forEach(med => {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(COLORS.dark);
        const medText = typeof med === 'string' ? med : String(med);
        const lines = doc.splitTextToSize("• " + medText, 505);
        doc.text(lines, left + 10, y);
        y += lines.length * 13 + 4;
      });
    }
    // Medical history
    if (patient.medicalHistory) {
      y = addStyledSubheader(doc, "Medical History", left, y);
      y = addStyledText(doc, patient.medicalHistory, left, y, 11, COLORS.dark);
    }
    y += 20;
  }

  // Agent Summary Section with enhanced styling
  if (agents?.length) {
    y = addStyledHeader(doc, "AI Agent Summary", left, y);
    
    // Add background for agent section
    addColoredBox(doc, left - 10, y - 20, right - left + 20, agents.length * 25 + 20, COLORS.light);
    
    agents.forEach((agent, idx) => {
      // Agent name with status indicator
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.dark);
      doc.text(agent.name, left, y);
      
      // Status with color coding
      let statusColor = COLORS.secondary;
      if (agent.status === "completed") statusColor = COLORS.success;
      else if (agent.status === "processing") statusColor = COLORS.warning;
      else if (agent.status === "error") statusColor = COLORS.danger;
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(statusColor);
      doc.text(agent.status.toUpperCase(), left + 120, y);
      
      // Progress bar visualization
      const progressWidth = 100;
      const progressHeight = 8;
      const progressX = right - progressWidth - 20;
      
      // Background bar
      addColoredBox(doc, progressX, y - 6, progressWidth, progressHeight, COLORS.border);
      
      // Progress bar
      const progressFill = (agent.progress / 100) * progressWidth;
      let progressColor = COLORS.success;
      if (agent.progress < 50) progressColor = COLORS.warning;
      if (agent.progress < 25) progressColor = COLORS.danger;
      
      addColoredBox(doc, progressX, y - 6, progressFill, progressHeight, progressColor);
      
      // Progress percentage
      doc.setTextColor(COLORS.dark);
      doc.text(`${agent.progress}%`, progressX + progressWidth + 5, y);
      
      y += 25;
    });
    
    y += 20;
  }

  // Individual Results Section with enhanced styling
  y = addStyledHeader(doc, "Diagnostic Results", left, y);
  
  if (!results.length) {
    addStyledText(doc, "No results available.", left, y, 12, COLORS.secondary);
    y += 30;
  } else {
    results.forEach((result, idx) => {
      // Check if we need a new page before adding result
      y = checkPageBreak(doc, y, 100);
      
      // Result header with enhanced styling
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.dark);
  doc.text(`${idx + 1}. ${result.condition}`, left, y);
  y += 18; // Add space after disease name to prevent overwrite
      
  // Confidence and severity indicators (now with color blocks)
  const confidenceX = right - 120;
  // Confidence bar
  const confBarWidth = 60;
  const confBarHeight = 8;
  const confBarX = confidenceX;
  addColoredBox(doc, confBarX, y - 8, confBarWidth, confBarHeight, COLORS.border);
  const confFill = (result.confidence / 100) * confBarWidth;
  let confColor = COLORS.success;
  if (result.confidence < 70) confColor = COLORS.warning;
  if (result.confidence < 50) confColor = COLORS.danger;
  addColoredBox(doc, confBarX, y - 8, confFill, confBarHeight, confColor);
  doc.setFontSize(10);
  doc.setTextColor(COLORS.secondary);
  doc.text(`${Math.round(result.confidence)}%`, confBarX + confBarWidth + 8, y - 1);
  // Severity indicator as colored circle
  const severityX = addSeverityIndicator(doc, result.severity, left, y - 8);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.dark);
  doc.text(result.severity.toUpperCase(), severityX, y);
  y += 20;
      
      // Source information
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.secondary);
      doc.text(`Source: ${result.source}`, left, y);
      y += 15;
      
      // Evidence section
      if (result.evidence?.length) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(COLORS.dark);
        doc.text("Evidence:", left, y);
        y += 15;
        
        result.evidence.forEach(evidence => {
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(COLORS.dark);
          // Ensure evidence is converted to string to avoid [object Object]
          const evidenceText = typeof evidence === 'string' ? evidence : String(evidence);
          const lines = doc.splitTextToSize("• " + evidenceText, 505);
          doc.text(lines, left + 10, y);
          // Improved spacing to prevent overlap
          y += lines.length * 12 + 4;
        });
        y += 5;
      }
      
      // Recommendations section
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.dark);
      doc.text("Recommendations:", left, y);
      y += 15;
      if (result.recommendations?.length) {
        result.recommendations.forEach(rec => {
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(COLORS.dark);
          // Handle object recommendations gracefully
          let recText = '';
          if (typeof rec === 'string') {
            recText = rec;
          } else if (rec && typeof rec === 'object') {
            // Try common fields, fallback to JSON
            const recObj = rec as any;
            recText = recObj.name || recObj.text || recObj.description || '';
            if (!recText) {
              recText = JSON.stringify(recObj);
            }
          } else {
            recText = String(rec);
          }
          const lines = doc.splitTextToSize("• " + recText, 505);
          doc.text(lines, left + 10, y);
          // Improved spacing to prevent overlap
          y += lines.length * 12 + 4;
        });
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(COLORS.secondary);
        doc.text("No recommendations provided.", left + 10, y);
        y += 16;
      }
      y += 5;
      
      // Add enhanced section divider between results
      if (idx < results.length - 1) {
        addSectionDivider(doc, left, y, right - left);
        y += 15;
      }
    });
  }

  // Consensus Section with enhanced styling
  if (consensus) {
    // Check if we need a new page
    y = checkPageBreak(doc, y, 120);
    
    y = addStyledHeader(doc, "Consensus Diagnosis", left, y);
    
  // Add background for consensus section
  addColoredBox(doc, left - 10, y - 20, right - left + 20, 100, COLORS.light);
    
    // Primary diagnosis with enhanced styling
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.primary);
    doc.text("Primary Diagnosis:", left, y);
    
    y += 20;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.dark);
    doc.text(consensus.primaryDiagnosis, left, y);
    
    // Confidence indicator with visual bar
    const confidenceX = right - 120;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.secondary);
    doc.text(`Confidence: ${Math.round(consensus.confidence)}%`, confidenceX, y);
    
    // Confidence bar
    const confBarWidth = 80;
    const confBarHeight = 6;
    const confBarX = confidenceX;
    addColoredBox(doc, confBarX, y + 5, confBarWidth, confBarHeight, COLORS.border);
    
    const confFill = (consensus.confidence / 100) * confBarWidth;
    let confColor = COLORS.success;
    if (consensus.confidence < 70) confColor = COLORS.warning;
    if (consensus.confidence < 50) confColor = COLORS.danger;
    
    addColoredBox(doc, confBarX, y + 5, confFill, confBarHeight, confColor);
    
    y += 30;
    
    // Alternative diagnoses
    if (consensus.alternativeDiagnoses?.length) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.dark);
      doc.text("Alternative Diagnoses:", left, y);
      y += 15;
      
      consensus.alternativeDiagnoses.forEach((alt, idx) => {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(COLORS.dark);
        // Ensure alt is converted to string to avoid [object Object]
        const altText = typeof alt === 'string' ? alt : String(alt);
        const lines = doc.splitTextToSize(`${idx + 1}. ${altText}`, 505);
        doc.text(lines, left + 10, y);
        // Improved spacing to prevent overlap
        y += lines.length * 13 + 4;
      });
    }
    
    y += 20;
  }

  // Add footer with professional styling
  const footerY = pageHeight - 30;
  addSectionDivider(doc, left, footerY, right - left);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.secondary);
  doc.text("Generated by MedsAI Diagnostic System", left, footerY + 15);
  doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, right - 50, footerY + 15);

  // Add watermark to last page if needed
  addWatermark(doc, pageWidth, pageHeight);
  return doc;
}

export function downloadDiagnosticPdf(filename: string, doc: jsPDF) {
  const safe = filename.replace(/[^a-z0-9\-_]+/gi, "_");
  doc.save(`${safe || "diagnostic_report"}.pdf`);
}


