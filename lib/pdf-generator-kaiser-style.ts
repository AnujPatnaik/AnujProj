import { jsPDF } from "jspdf"
import "jspdf-autotable"
import type { UserOptions } from "jspdf-autotable"

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF
  }
}

export async function generatePDF(assessmentData: any[], results: any) {
  try {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    let currentPage = 1

    // Kaiser-style color palette
    const colors = {
      kaiserBlue: [31, 78, 121], // Dark blue like Kaiser
      mediumBlue: [68, 114, 196], // Medium blue
      lightBlue: [217, 226, 243], // Light blue
      white: [255, 255, 255],
      black: [0, 0, 0],
      gray: [128, 128, 128],
      lightGray: [242, 242, 242],
      red: [204, 0, 0],
      orange: [255, 192, 0],
      green: [0, 176, 80],
    }

    // Helper function to add page numbers
    const addPageNumber = () => {
      doc.setFontSize(10)
      doc.setTextColor(...colors.gray)
      doc.text(`Page ${currentPage}`, pageWidth - 20, pageHeight - 10)
      currentPage++
    }

    // COVER PAGE - Kaiser Style
    // Header background
    doc.setFillColor(...colors.kaiserBlue)
    doc.rect(0, 0, pageWidth, 35, "F")

    // Main title
    doc.setTextColor(...colors.white)
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("TIPNOW HVA", 20, 25)

    // Subtitle
    doc.setFillColor(...colors.mediumBlue)
    doc.rect(0, 35, pageWidth, 15, "F")
    doc.setTextColor(...colors.white)
    doc.setFontSize(14)
    doc.setFont("helvetica", "normal")
    doc.text("Emergency Management", 20, 45)

    // Summary section
    doc.setFillColor(...colors.lightBlue)
    doc.rect(10, 60, pageWidth - 20, 15, "F")
    doc.setTextColor(...colors.black)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Summary For - HEALTHCARE FACILITY", 15, 70)

    // Date
    doc.setTextColor(...colors.black)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    doc.text(`Generated on: ${currentDate}`, 15, 85)

    // Alert Type Summary Table
    let yPos = 100
    doc.setFillColor(...colors.mediumBlue)
    doc.rect(15, yPos, 80, 8, "F")
    doc.setTextColor(...colors.white)
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("ALERT TYPE", 20, yPos + 6)
    doc.text("OCCURRENCE", 70, yPos + 6)

    yPos += 8
    const alertData = [
      ["Natural Hazards", assessmentData.filter((h) => h.id < 20 && h.probability > 0).length],
      ["Technological Hazards", assessmentData.filter((h) => h.id >= 20 && h.id < 35 && h.probability > 0).length],
      ["Human-Related Hazards", assessmentData.filter((h) => h.id >= 35 && h.probability > 0).length],
      ["High Risk (≥25)", results.hazardsWithScores.filter((h: any) => h.score >= 25).length],
      ["Medium Risk (15-24)", results.hazardsWithScores.filter((h: any) => h.score >= 15 && h.score < 25).length],
      ["Low Risk (<15)", results.hazardsWithScores.filter((h: any) => h.score > 0 && h.score < 15).length],
      ["Total Assessed", assessmentData.filter((h) => h.probability > 0).length],
    ]

    alertData.forEach((row, index) => {
      doc.setFillColor(...(index % 2 === 0 ? colors.lightGray : colors.white))
      doc.rect(15, yPos, 80, 6, "F")
      doc.setTextColor(...colors.black)
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text(row[0].toString(), 20, yPos + 4)
      doc.text(row[1].toString(), 75, yPos + 4)
      yPos += 6
    })

    // Simple Risk Distribution Chart
    yPos += 10
    doc.setFillColor(...colors.mediumBlue)
    doc.rect(15, yPos, 80, 8, "F")
    doc.setTextColor(...colors.white)
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("RISK DISTRIBUTION", 20, yPos + 6)

    yPos += 15
    const totalRisks = results.hazardsWithScores.filter((h: any) => h.score > 0).length
    const highRisk = results.hazardsWithScores.filter((h: any) => h.score >= 25).length
    const mediumRisk = results.hazardsWithScores.filter((h: any) => h.score >= 15 && h.score < 25).length
    const lowRisk = results.hazardsWithScores.filter((h: any) => h.score > 0 && h.score < 15).length

    if (totalRisks > 0) {
      const chartWidth = 60
      const highWidth = (highRisk / totalRisks) * chartWidth
      const mediumWidth = (mediumRisk / totalRisks) * chartWidth
      const lowWidth = (lowRisk / totalRisks) * chartWidth

      let xPos = 20
      if (highWidth > 0) {
        doc.setFillColor(...colors.red)
        doc.rect(xPos, yPos, highWidth, 8, "F")
        xPos += highWidth
      }
      if (mediumWidth > 0) {
        doc.setFillColor(...colors.orange)
        doc.rect(xPos, yPos, mediumWidth, 8, "F")
        xPos += mediumWidth
      }
      if (lowWidth > 0) {
        doc.setFillColor(...colors.green)
        doc.rect(xPos, yPos, lowWidth, 8, "F")
      }

      // Legend
      yPos += 15
      doc.setFillColor(...colors.red)
      doc.rect(20, yPos, 4, 4, "F")
      doc.setTextColor(...colors.black)
      doc.setFontSize(8)
      doc.text(`High Risk: ${highRisk}`, 26, yPos + 3)

      doc.setFillColor(...colors.orange)
      doc.rect(20, yPos + 6, 4, 4, "F")
      doc.text(`Medium Risk: ${mediumRisk}`, 26, yPos + 9)

      doc.setFillColor(...colors.green)
      doc.rect(20, yPos + 12, 4, 4, "F")
      doc.text(`Low Risk: ${lowRisk}`, 26, yPos + 15)
    }

    addPageNumber()

    // PAGE 2: TOP 10 HVA - Kaiser Style
    doc.addPage()

    // Header
    doc.setFillColor(...colors.kaiserBlue)
    doc.rect(0, 0, pageWidth, 25, "F")
    doc.setTextColor(...colors.white)
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("TOP 10 HVA RANKING", 20, 17)

    // Year section
    yPos = 40
    doc.setFillColor(...colors.lightBlue)
    doc.rect(15, yPos, pageWidth - 30, 8, "F")
    doc.setTextColor(...colors.black)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("YEAR", 20, yPos + 6)

    // Top 10 table header
    yPos += 15
    doc.setFillColor(...colors.mediumBlue)
    doc.rect(15, yPos, pageWidth - 30, 8, "F")
    doc.setTextColor(...colors.white)
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("TOP 10 HVA", 20, yPos + 6)
    doc.text("RANK", 120, yPos + 6)
    doc.text("OCCURRENCE", 140, yPos + 6)
    doc.text("HVA RANK", 170, yPos + 6)

    // Top 10 data
    yPos += 8
    if (results.topRisks && results.topRisks.length > 0) {
      results.topRisks.slice(0, 10).forEach((risk: any, index: number) => {
        doc.setFillColor(...(index % 2 === 0 ? colors.lightGray : colors.white))
        doc.rect(15, yPos, pageWidth - 30, 6, "F")
        doc.setTextColor(...colors.black)
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")

        const truncatedName = risk.name.length > 25 ? risk.name.substring(0, 25) + "..." : risk.name
        doc.text(truncatedName, 20, yPos + 4)
        doc.text((index + 1).toString(), 125, yPos + 4)
        doc.text(risk.score.toString(), 145, yPos + 4)
        doc.text((index + 1).toString(), 175, yPos + 4)
        yPos += 6
      })
    }

    // Bar Chart for Top Risks
    if (results.topRisks && results.topRisks.length > 0) {
      yPos += 20
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...colors.black)
      doc.text("Risk Score Visualization", 20, yPos)

      yPos += 10
      const chartHeight = 60
      const chartWidth = pageWidth - 40
      const maxScore = Math.max(...results.topRisks.slice(0, 10).map((r: any) => r.score))

      // Chart background
      doc.setFillColor(248, 250, 252)
      doc.rect(20, yPos, chartWidth, chartHeight, "F")
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.5)
      doc.rect(20, yPos, chartWidth, chartHeight, "S")

      // Draw bars
      const barColors = [
        colors.red,
        colors.orange,
        [255, 165, 0],
        [255, 215, 0],
        [173, 255, 47],
        colors.green,
        [0, 191, 255],
        colors.mediumBlue,
        [138, 43, 226],
        [255, 20, 147],
      ]

      results.topRisks.slice(0, 10).forEach((risk: any, index: number) => {
        if (risk.score && maxScore > 0) {
          const barHeight = (risk.score / maxScore) * (chartHeight - 20)
          const barWidth = (chartWidth - 20) / 10 - 2
          const xPos = 25 + index * (barWidth + 2)
          const yBarPos = yPos + chartHeight - 10 - barHeight

          const color = barColors[index] || colors.mediumBlue
          doc.setFillColor(...color)
          doc.rect(xPos, yBarPos, barWidth, barHeight, "F")

          // Score label
          doc.setFontSize(7)
          doc.setTextColor(...colors.black)
          doc.text(risk.score.toString(), xPos + barWidth / 2, yBarPos - 2, { align: "center" })
        }
      })
    }

    addPageNumber()

    // PAGE 3: DETAILED DATA TABLE
    doc.addPage()

    // Header
    doc.setFillColor(...colors.kaiserBlue)
    doc.rect(0, 0, pageWidth, 25, "F")
    doc.setTextColor(...colors.white)
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("DETAILED ASSESSMENT DATA", 20, 17)

    // Prepare table data
    const tableData = assessmentData
      .filter((item) => item.probability > 0)
      .map((item) => [
        item.id.toString(),
        item.name,
        getProbabilityLabel(item.probability),
        item.alerts.toString(),
        item.activations.toString(),
        getImpactLabel(item.humanImpact),
        getImpactLabel(item.propertyImpact),
        getImpactLabel(item.businessImpact),
        getResponseLabel(item.preparedness),
        getResponseLabel(item.internalResponse),
        getResponseLabel(item.externalResponse),
        (item.score || 0).toString(),
      ])

    if (tableData.length > 0) {
      doc.autoTable({
        startY: 35,
        head: [
          [
            "ID",
            "Hazard Name",
            "Probability",
            "Alerts",
            "Activations",
            "Human Impact",
            "Property Impact",
            "Business Impact",
            "Preparedness",
            "Internal Response",
            "External Response",
            "Risk Score",
          ],
        ],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: colors.mediumBlue,
          textColor: colors.white,
          fontStyle: "bold",
          fontSize: 8,
          halign: "center",
        },
        bodyStyles: {
          fontSize: 7,
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 25, halign: "left" },
          11: { cellWidth: 15, fontStyle: "bold" },
        },
        alternateRowStyles: {
          fillColor: colors.lightGray,
        },
        margin: { left: 10, right: 10 },
        didParseCell: (data) => {
          // Highlight high-risk scores
          if (data.column.index === 11 && Number.parseInt(data.cell.text[0]) >= 25) {
            data.cell.styles.fillColor = [255, 230, 230]
            data.cell.styles.textColor = colors.red
            data.cell.styles.fontStyle = "bold"
          }
        },
      })
    }

    addPageNumber()

    return doc.output("blob")
  } catch (error) {
    console.error("PDF Generation Error:", error)
    throw new Error("Failed to generate PDF report. Please try again.")
  }
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
