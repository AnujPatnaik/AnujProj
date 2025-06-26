import * as XLSX from "xlsx"

interface HazardData {
  id: number
  name: string
  category: string
  probability: number
  alerts: number
  activations: number
  humanImpact: number
  propertyImpact: number
  businessImpact: number
  preparedness: number
  internalResponse: number
  externalResponse: number
  riskScore: number
}

// Convert numeric values to text labels
const getTextValue = (value: number, type: "probability" | "impact" | "response"): string => {
  if (value === 0) return "N/A"

  switch (type) {
    case "probability":
      switch (value) {
        case 1:
          return "Low"
        case 2:
          return "Moderate"
        case 3:
          return "High"
        default:
          return "N/A"
      }
    case "impact":
      switch (value) {
        case 1:
          return "Low"
        case 2:
          return "Moderate"
        case 3:
          return "High"
        default:
          return "N/A"
      }
    case "response":
      switch (value) {
        case 1:
          return "Poor"
        case 2:
          return "Fair"
        case 3:
          return "Good"
        default:
          return "N/A"
      }
  }
}

export function generateExcel(assessmentData: any[], results: any): Blob {
  // Create workbook
  const wb = XLSX.utils.book_new()

  // Prepare data for Excel - exactly like the image format
  const excelData = assessmentData.map((hazard, index) => ({
    ID: hazard.id || index + 1,
    "Hazard Name": hazard.name,
    Probability: getTextValue(hazard.probability, "probability"),
    "Number of Alerts": hazard.alerts || 0,
    "Number of Activations": hazard.activations || 0,
    "Human Impact": getTextValue(hazard.humanImpact, "impact"),
    "Property Impact": getTextValue(hazard.propertyImpact, "impact"),
    "Business Impact": getTextValue(hazard.businessImpact, "impact"),
    Preparedness: getTextValue(hazard.preparedness, "response"),
    "Internal Response": getTextValue(hazard.internalResponse, "response"),
    "External Response": getTextValue(hazard.externalResponse, "response"),
    "Risk Score": hazard.score || 0,
  }))

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(excelData)

  // Set column widths
  const colWidths = [
    { wch: 5 }, // ID
    { wch: 25 }, // Hazard Name
    { wch: 12 }, // Probability
    { wch: 15 }, // Number of Alerts
    { wch: 18 }, // Number of Activations
    { wch: 15 }, // Human Impact
    { wch: 15 }, // Property Impact
    { wch: 15 }, // Business Impact
    { wch: 15 }, // Preparedness
    { wch: 17 }, // Internal Response
    { wch: 17 }, // External Response
    { wch: 12 }, // Risk Score
  ]

  ws["!cols"] = colWidths

  // Get the range of the worksheet
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1")

  // Style the header row with background color and proper alignment
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
    if (ws[cellAddress]) {
      ws[cellAddress].s = {
        font: {
          bold: true,
          color: { rgb: "FFFFFF" }, // White text
        },
        fill: {
          fgColor: { rgb: "4472C4" }, // Blue background for headers
        },
        alignment: {
          horizontal: "center",
          vertical: "top", // Top alignment as requested
          wrapText: true,
        },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      }
    }
  }

  // Style data rows with proper alignment and borders
  for (let row = range.s.r + 1; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          alignment: {
            horizontal: col === 1 ? "left" : "center", // Hazard name left-aligned, others centered
            vertical: "top", // Top alignment for all cells
          },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        }
      }
    }
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "HVA Assessment")

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

  return blob
}
