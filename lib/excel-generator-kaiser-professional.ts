import * as XLSX from "xlsx"

export function generateExcel(assessmentData: any[], results: any) {
  // Create workbook
  const wb = XLSX.utils.book_new()

  // Create the main Kaiser-style sheet data
  const sheetData = [
    // Row 1: Main Header - Kaiser Permanente style
    ["Kaiser Permanente", "", "", "", "", "", "", "", "", "", "", "", "", ""],

    // Row 2: Subtitle - Emergency Management
    ["Emergency Management", "", "", "", "", "", "", "", "", "", "", "", "", ""],

    // Row 3: Empty
    ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],

    // Row 4: Site info
    ["Hazards - HEALTHCARE FACILITY", "", "", "", "", "", "", "", "", "", "", "", "", ""],

    // Row 5: Tool description
    ["Hazard Vulnerability Assessment Tool", "", "", "", "", "", "", "", "", "", "", "", "", ""],

    // Row 6-7: Empty
    ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],

    // Row 8: Severity formula header - spans multiple columns
    ["", "", "", "", "", "", "", "SEVERITY = ( MAGNITUDE - MITIGATION )", "", "", "", "", "", ""],

    // Row 9: Main column headers
    [
      "Alert Type",
      "",
      "PROBABILITY",
      "ALERTS",
      "ACTIVATIONS",
      "HUMAN IMPACT",
      "PROPERTY IMPACT",
      "BUSINESS IMPACT",
      "PREPARED-NESS",
      "INTERNAL RESPONSE",
      "EXTERNAL RESPONSE",
      "",
      "RISK",
      "",
    ],

    // Row 10: Column descriptions
    [
      "",
      "",
      "Likelihood this will occur",
      "",
      "",
      "Possibility of death or injury",
      "Physical losses and damages",
      "Interruption of services",
      "Preplanning",
      "Time, effectiveness, resources",
      "Community/Mutual Aid staff and supplies",
      "",
      "* Relative threat",
      "",
    ],

    // Row 11: Empty
    ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],

    // Row 12: SCORE header
    ["SCORE", "", "", "", "", "", "", "", "", "", "", "", "", ""],

    // Row 13-16: Scoring system with proper descriptions
    [
      "",
      "",
      "0 = N/A",
      "Number of",
      "Number of",
      "0 = N/A",
      "0 = N/A",
      "0 = N/A",
      "0 = N/A",
      "0 = N/A",
      "0 = N/A",
      "",
      "0 - 100%",
      "",
    ],
    [
      "",
      "",
      "1 = Low",
      "Alerts",
      "Activations",
      "1 = Low",
      "1 = Low",
      "1 = Low",
      "1 = High",
      "1 = High",
      "1 = High",
      "",
      "",
      "",
    ],
    [
      "",
      "",
      "2 = Moderate",
      "",
      "",
      "2 = Moderate",
      "2 = Moderate",
      "2 = Moderate",
      "2 = Moderate",
      "2 = Moderate",
      "2 = Moderate",
      "",
      "",
      "",
    ],
    ["", "", "3 = High", "", "", "3 = High", "3 = High", "3 = High", "3 = Low", "3 = Low", "3 = Low", "", "", ""],

    // Row 17: Empty
    ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],

    // Add assessment data rows (only assessed hazards)
    ...assessmentData
      .filter((item) => item.probability > 0)
      .map((item) => [
        item.name,
        "",
        item.probability,
        item.alerts,
        item.activations,
        item.humanImpact,
        item.propertyImpact,
        item.businessImpact,
        item.preparedness,
        item.internalResponse,
        item.externalResponse,
        "",
        item.score || 0,
        "",
      ]),
  ]

  const ws = XLSX.utils.aoa_to_sheet(sheetData)

  // Set column widths to match Kaiser format exactly
  ws["!cols"] = [
    { wch: 25 }, // A: Alert Type
    { wch: 2 }, // B: Spacer
    { wch: 12 }, // C: Probability
    { wch: 10 }, // D: Alerts
    { wch: 12 }, // E: Activations
    { wch: 12 }, // F: Human Impact
    { wch: 12 }, // G: Property Impact
    { wch: 12 }, // H: Business Impact
    { wch: 12 }, // I: Preparedness
    { wch: 12 }, // J: Internal Response
    { wch: 15 }, // K: External Response
    { wch: 2 }, // L: Spacer
    { wch: 10 }, // M: Risk
    { wch: 2 }, // N: Spacer
  ]

  // KAISER PERMANENTE PROFESSIONAL STYLING

  // Main header - Kaiser Permanente (Row 1) - Dark Blue with White Text
  if (ws["A1"]) {
    ws["A1"].s = {
      font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "1F4E79" } }, // Kaiser dark blue
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "medium", color: { rgb: "000000" } },
        bottom: { style: "medium", color: { rgb: "000000" } },
        left: { style: "medium", color: { rgb: "000000" } },
        right: { style: "medium", color: { rgb: "000000" } },
      },
    }
  }

  // Emergency Management (Row 2) - Medium Blue
  if (ws["A2"]) {
    ws["A2"].s = {
      font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } }, // Kaiser medium blue
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "medium", color: { rgb: "000000" } },
        right: { style: "medium", color: { rgb: "000000" } },
      },
    }
  }

  // Site info (Row 4) - Bold black text
  if (ws["A4"]) {
    ws["A4"].s = {
      font: { bold: true, sz: 11 },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "medium", color: { rgb: "000000" } },
        right: { style: "medium", color: { rgb: "000000" } },
      },
    }
  }

  // Tool description (Row 5)
  if (ws["A5"]) {
    ws["A5"].s = {
      font: { sz: 10 },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "medium", color: { rgb: "000000" } },
        right: { style: "medium", color: { rgb: "000000" } },
      },
    }
  }

  // Severity formula header (Row 8) - Yellow background with black border
  for (let col = 7; col <= 10; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 7, c: col })
    if (ws[cellAddress]) {
      ws[cellAddress].s = {
        font: { bold: true, sz: 11, color: { rgb: "000000" } },
        fill: { fgColor: { rgb: "FFFF99" } }, // Yellow background
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "medium", color: { rgb: "000000" } },
          bottom: { style: "medium", color: { rgb: "000000" } },
          left: { style: "medium", color: { rgb: "000000" } },
          right: { style: "medium", color: { rgb: "000000" } },
        },
      }
    }
  }

  // Column headers (Row 9) - Different colors for each category like Kaiser
  const headerColors = [
    { col: 0, color: "D9E2F3", textColor: "000000" }, // Light blue for Alert Type
    { col: 1, color: "FFFFFF", textColor: "000000" }, // White spacer
    { col: 2, color: "B4C6E7", textColor: "000000" }, // Light blue for Probability
    { col: 3, color: "B4C6E7", textColor: "000000" }, // Light blue for Alerts
    { col: 4, color: "B4C6E7", textColor: "000000" }, // Light blue for Activations
    { col: 5, color: "F8CBAD", textColor: "000000" }, // Light orange for Human Impact
    { col: 6, color: "F8CBAD", textColor: "000000" }, // Light orange for Property Impact
    { col: 7, color: "F8CBAD", textColor: "000000" }, // Light orange for Business Impact
    { col: 8, color: "C6E0B4", textColor: "000000" }, // Light green for Preparedness
    { col: 9, color: "C6E0B4", textColor: "000000" }, // Light green for Internal Response
    { col: 10, color: "C6E0B4", textColor: "000000" }, // Light green for External Response
    { col: 11, color: "FFFFFF", textColor: "000000" }, // White spacer
    { col: 12, color: "FFFF99", textColor: "000000" }, // Yellow for Risk
    { col: 13, color: "FFFFFF", textColor: "000000" }, // White spacer
  ]

  // Apply header styling (Row 9)
  headerColors.forEach(({ col, color, textColor }) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 8, c: col })
    if (ws[cellAddress]) {
      ws[cellAddress].s = {
        font: { bold: true, sz: 10, color: { rgb: textColor } },
        fill: { fgColor: { rgb: color } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: {
          top: { style: "medium", color: { rgb: "000000" } },
          bottom: { style: "medium", color: { rgb: "000000" } },
          left: { style: "medium", color: { rgb: "000000" } },
          right: { style: "medium", color: { rgb: "000000" } },
        },
      }
    }
  })

  // Description row (Row 10) - Same colors as headers
  headerColors.forEach(({ col, color, textColor }) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 9, c: col })
    if (ws[cellAddress]) {
      ws[cellAddress].s = {
        font: { sz: 9, color: { rgb: textColor } },
        fill: { fgColor: { rgb: color } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: {
          top: { style: "medium", color: { rgb: "000000" } },
          bottom: { style: "medium", color: { rgb: "000000" } },
          left: { style: "medium", color: { rgb: "000000" } },
          right: { style: "medium", color: { rgb: "000000" } },
        },
      }
    }
  })

  // SCORE header (Row 12) - Gray background
  if (ws["A12"]) {
    ws["A12"].s = {
      font: { bold: true, sz: 11, color: { rgb: "000000" } },
      fill: { fgColor: { rgb: "D9D9D9" } }, // Gray background
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "medium", color: { rgb: "000000" } },
        bottom: { style: "medium", color: { rgb: "000000" } },
        left: { style: "medium", color: { rgb: "000000" } },
        right: { style: "medium", color: { rgb: "000000" } },
      },
    }
  }

  // Scoring system rows (Rows 13-16) - Same colors as main headers
  for (let row = 12; row <= 15; row++) {
    headerColors.forEach(({ col, color, textColor }) => {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { sz: 8, color: { rgb: textColor } },
          fill: { fgColor: { rgb: color } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "medium", color: { rgb: "000000" } },
            bottom: { style: "medium", color: { rgb: "000000" } },
            left: { style: "medium", color: { rgb: "000000" } },
            right: { style: "medium", color: { rgb: "000000" } },
          },
        }
      }
    })
  }

  // Data rows styling (starting from row 18) - Professional borders and colors
  const dataStartRow = 17
  const dataRows = assessmentData.filter((item) => item.probability > 0).length

  for (let row = dataStartRow; row < dataStartRow + dataRows; row++) {
    headerColors.forEach(({ col, color }) => {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      if (ws[cellAddress]) {
        // Use same colors as headers but slightly lighter for data rows
        let bgColor = color
        if (color === "B4C6E7") bgColor = "E8F1FF"
        else if (color === "F8CBAD") bgColor = "FFF2E8"
        else if (color === "C6E0B4") bgColor = "F0F8E8"
        else if (color === "FFFF99") bgColor = "FFFFCC"
        else if (color === "D9E2F3") bgColor = "F0F4FF"

        ws[cellAddress].s = {
          font: { sz: 9, color: { rgb: "000000" } },
          fill: { fgColor: { rgb: bgColor } },
          alignment: {
            horizontal: col === 0 ? "left" : "center",
            vertical: "center",
          },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "medium", color: { rgb: "000000" } },
            right: { style: "medium", color: { rgb: "000000" } },
          },
        }

        // Highlight high risk scores in red
        if (col === 12 && ws[cellAddress].v >= 25) {
          ws[cellAddress].s.fill = { fgColor: { rgb: "FF9999" } }
          ws[cellAddress].s.font = { ...ws[cellAddress].s.font, bold: true, color: { rgb: "CC0000" } }
        }
      }
    })
  }

  // Merge cells for headers - exactly like Kaiser format
  ws["!merges"] = [
    // Main headers
    { s: { r: 0, c: 0 }, e: { r: 0, c: 13 } }, // Kaiser Permanente
    { s: { r: 1, c: 0 }, e: { r: 1, c: 13 } }, // Emergency Management
    { s: { r: 3, c: 0 }, e: { r: 3, c: 13 } }, // Site info
    { s: { r: 4, c: 0 }, e: { r: 4, c: 13 } }, // Tool description

    // Severity formula - spans 4 columns
    { s: { r: 7, c: 7 }, e: { r: 7, c: 10 } }, // Severity formula

    // Risk column header
    { s: { r: 8, c: 12 }, e: { r: 8, c: 13 } }, // Risk header
    { s: { r: 9, c: 12 }, e: { r: 9, c: 13 } }, // Risk description

    // Score section
    { s: { r: 11, c: 0 }, e: { r: 11, c: 1 } }, // SCORE header
  ]

  // Set row heights for professional appearance
  ws["!rows"] = [
    { hpt: 30 }, // Row 1 - Kaiser Permanente header
    { hpt: 25 }, // Row 2 - Emergency Management
    { hpt: 15 }, // Row 3
    { hpt: 20 }, // Row 4 - Site info
    { hpt: 18 }, // Row 5 - Tool description
    { hpt: 10 }, // Row 6
    { hpt: 10 }, // Row 7
    { hpt: 25 }, // Row 8 - Severity formula
    { hpt: 40 }, // Row 9 - Column headers
    { hpt: 50 }, // Row 10 - Descriptions
    { hpt: 15 }, // Row 11
    { hpt: 20 }, // Row 12 - SCORE
    { hpt: 30 }, // Row 13-16 - Scoring system
    { hpt: 30 },
    { hpt: 30 },
    { hpt: 30 },
    { hpt: 15 }, // Row 17
  ]

  // Add the worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Kaiser HVA Professional")

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

  return blob
}
