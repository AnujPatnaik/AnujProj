import * as XLSX from "xlsx"

export function generateExcel(assessmentData: any[], results: any) {
  // Create workbook
  const wb = XLSX.utils.book_new()

  // MAIN ASSESSMENT SHEET - Kaiser Style
  const mainSheetData = [
    // Header section
    ["TIPNOW HVA", "", "", "", "", "", "", "", "", "", "", ""],
    ["Emergency Management", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", ""],
    ["Summary For - HEALTHCARE FACILITY", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", ""],

    // Alert Type Summary
    ["ALERT TYPE", "OCCURRENCE", "", "", "", "", "", "", "", "", "", ""],
    [
      "Natural Hazards",
      assessmentData.filter((h) => h.id < 20 && h.probability > 0).length,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    [
      "Technological Hazards",
      assessmentData.filter((h) => h.id >= 20 && h.id < 35 && h.probability > 0).length,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    [
      "Human-Related Hazards",
      assessmentData.filter((h) => h.id >= 35 && h.probability > 0).length,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    [
      "High Risk (≥25)",
      results.hazardsWithScores.filter((h: any) => h.score >= 25).length,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    [
      "Medium Risk (15-24)",
      results.hazardsWithScores.filter((h: any) => h.score >= 15 && h.score < 25).length,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    [
      "Low Risk (<15)",
      results.hazardsWithScores.filter((h: any) => h.score > 0 && h.score < 15).length,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    ["Total Assessed", assessmentData.filter((h) => h.probability > 0).length, "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", ""],

    // Top 10 HVA Section
    ["YEAR", "", "", "", "", "", "", "", "", "", "", ""],
    ["TOP 10 HVA", "RANK", "OCCURRENCE", "HVA RANK", "", "", "", "", "", "", "", ""],
    ...results.topRisks
      .slice(0, 10)
      .map((risk: any, index: number) => [risk.name, index + 1, risk.score, index + 1, "", "", "", "", "", "", "", ""]),
    ["", "", "", "", "", "", "", "", "", "", "", ""],

    // Detailed Assessment Data
    ["DETAILED ASSESSMENT DATA", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", ""],
    [
      "ID",
      "Hazard Name",
      "Probability",
      "Number of Alerts",
      "Number of Activations",
      "Human Impact",
      "Property Impact",
      "Business Impact",
      "Preparedness",
      "Internal Response",
      "External Response",
      "Risk Score",
    ],
    ...assessmentData.map((item) => [
      item.id,
      item.name,
      getProbabilityLabel(item.probability),
      item.alerts,
      item.activations,
      getImpactLabel(item.humanImpact),
      getImpactLabel(item.propertyImpact),
      getImpactLabel(item.businessImpact),
      getResponseLabel(item.preparedness),
      getResponseLabel(item.internalResponse),
      getResponseLabel(item.externalResponse),
      item.score || 0,
    ]),
  ]

  const mainWS = XLSX.utils.aoa_to_sheet(mainSheetData)

  // Set column widths
  const colWidths = [
    { wch: 8 }, // ID
    { wch: 25 }, // Hazard Name
    { wch: 12 }, // Probability
    { wch: 15 }, // Alerts
    { wch: 18 }, // Activations
    { wch: 15 }, // Human Impact
    { wch: 16 }, // Property Impact
    { wch: 16 }, // Business Impact
    { wch: 15 }, // Preparedness
    { wch: 17 }, // Internal Response
    { wch: 17 }, // External Response
    { wch: 12 }, // Risk Score
  ]
  mainWS["!cols"] = colWidths

  // STYLING - Kaiser Permanente Style

  // Main header (TIPNOW HVA)
  if (mainWS["A1"]) {
    mainWS["A1"].s = {
      font: { bold: true, sz: 18, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "1F4E79" } }, // Dark blue like Kaiser
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    }
  }

  // Emergency Management subtitle
  if (mainWS["A2"]) {
    mainWS["A2"].s = {
      font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } }, // Medium blue
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    }
  }

  // Summary section header
  if (mainWS["A4"]) {
    mainWS["A4"].s = {
      font: { bold: true, sz: 11, color: { rgb: "000000" } },
      fill: { fgColor: { rgb: "D9E2F3" } }, // Light blue
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    }
  }

  // Alert Type section headers
  const alertTypeRow = 6
  for (let col = 0; col < 3; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: alertTypeRow - 1, c: col })
    if (mainWS[cellAddress]) {
      mainWS[cellAddress].s = {
        font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      }
    }
  }

  // Alert type data rows with alternating colors
  for (let row = alertTypeRow; row < alertTypeRow + 7; row++) {
    for (let col = 0; col < 3; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      if (mainWS[cellAddress]) {
        mainWS[cellAddress].s = {
          font: { sz: 10 },
          fill: { fgColor: { rgb: row % 2 === 0 ? "F2F2F2" : "FFFFFF" } },
          alignment: { horizontal: col === 0 ? "left" : "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
            left: { style: "thin", color: { rgb: "CCCCCC" } },
            right: { style: "thin", color: { rgb: "CCCCCC" } },
          },
        }
      }
    }
  }

  // Top 10 HVA section headers
  const top10Row = 16
  for (let col = 0; col < 4; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: top10Row, c: col })
    if (mainWS[cellAddress]) {
      mainWS[cellAddress].s = {
        font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      }
    }
  }

  // Top 10 data rows
  for (let row = top10Row + 1; row < top10Row + 11; row++) {
    for (let col = 0; col < 4; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      if (mainWS[cellAddress]) {
        mainWS[cellAddress].s = {
          font: { sz: 10 },
          fill: { fgColor: { rgb: row % 2 === 0 ? "F2F2F2" : "FFFFFF" } },
          alignment: { horizontal: col === 0 ? "left" : "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
            left: { style: "thin", color: { rgb: "CCCCCC" } },
            right: { style: "thin", color: { rgb: "CCCCCC" } },
          },
        }

        // Highlight high risk scores
        if (col === 2) {
          // Risk score column
          const score = Number(mainWS[cellAddress].v)
          if (score >= 25) {
            mainWS[cellAddress].s.fill = { fgColor: { rgb: "FFE6E6" } }
            mainWS[cellAddress].s.font = { ...mainWS[cellAddress].s.font, color: { rgb: "CC0000" }, bold: true }
          }
        }
      }
    }
  }

  // Detailed data section header
  const detailHeaderRow = 29
  if (mainWS[XLSX.utils.encode_cell({ r: detailHeaderRow, c: 0 })]) {
    mainWS[XLSX.utils.encode_cell({ r: detailHeaderRow, c: 0 })].s = {
      font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "1F4E79" } },
      alignment: { horizontal: "left", vertical: "center" },
    }
  }

  // Detailed data table headers
  const dataHeaderRow = 31
  for (let col = 0; col < 12; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: dataHeaderRow, c: col })
    if (mainWS[cellAddress]) {
      mainWS[cellAddress].s = {
        font: { bold: true, sz: 10, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      }
    }
  }

  // Detailed data rows
  for (let row = dataHeaderRow + 1; row < dataHeaderRow + 1 + assessmentData.length; row++) {
    for (let col = 0; col < 12; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      if (mainWS[cellAddress]) {
        mainWS[cellAddress].s = {
          font: { sz: 9 },
          fill: { fgColor: { rgb: row % 2 === 0 ? "F8F9FA" : "FFFFFF" } },
          alignment: { horizontal: col === 1 ? "left" : "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "E5E7EB" } },
            bottom: { style: "thin", color: { rgb: "E5E7EB" } },
            left: { style: "thin", color: { rgb: "E5E7EB" } },
            right: { style: "thin", color: { rgb: "E5E7EB" } },
          },
        }

        // Highlight high-risk scores in the last column
        if (col === 11) {
          const score = Number(mainWS[cellAddress].v)
          if (score >= 25) {
            mainWS[cellAddress].s.fill = { fgColor: { rgb: "FEE2E2" } }
            mainWS[cellAddress].s.font = { ...mainWS[cellAddress].s.font, color: { rgb: "DC2626" }, bold: true }
          } else if (score >= 15) {
            mainWS[cellAddress].s.fill = { fgColor: { rgb: "FEF3C7" } }
            mainWS[cellAddress].s.font = { ...mainWS[cellAddress].s.font, color: { rgb: "D97706" } }
          }
        }
      }
    }
  }

  // Merge cells for headers
  mainWS["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }, // TIPNOW HVA header
    { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } }, // Emergency Management
    { s: { r: 3, c: 0 }, e: { r: 3, c: 11 } }, // Summary section
    { s: { r: 14, c: 0 }, e: { r: 14, c: 11 } }, // YEAR header
    { s: { r: 28, c: 0 }, e: { r: 28, c: 11 } }, // Detailed data header
  ]

  // Add the main worksheet
  XLSX.utils.book_append_sheet(wb, mainWS, "HVA Assessment - Kaiser Style")

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

  return blob
}

function getProbabilityLabel(value: number): string {
  const labels = ["N/A", "Low", "Moderate", "High"]
  return labels[value] || "N/A"
}

function getImpactLabel(value: number): string {
  const labels = ["N/A", "Low", "Moderate", "High"]
  return labels[value] || "N/A"
}

function getResponseLabel(value: number): string {
  const labels = ["N/A", "Poor", "Fair", "Good"]
  return labels[value] || "N/A"
}
