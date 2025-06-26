import { jsPDF } from "jspdf"
import "jspdf-autotable"
import type { UserOptions } from "jspdf-autotable"

// Extend the jsPDF type to include autoTable
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

    // Color palette (RGB values)
    const colors = {
      primary: [59, 130, 246],
      secondary: [16, 185, 129],
      accent: [245, 101, 101],
      warning: [251, 146, 60],
      gray: [107, 114, 128],
      lightGray: [243, 244, 246],
      white: [255, 255, 255],
      dark: [31, 41, 55],
    }

    // Helper function to add page numbers
    const addPageNumber = () => {
      doc.setFontSize(10)
      doc.setTextColor(107, 114, 128)
      doc.text(`Page ${currentPage}`, pageWidth - 20, pageHeight - 10)
      currentPage++
    }

    // COVER PAGE
    // Background
    doc.setFillColor(59, 130, 246)
    doc.rect(0, 0, pageWidth, pageHeight, "F")

    // White content area
    doc.setFillColor(255, 255, 255)
    doc.rect(30, 40, pageWidth - 60, pageHeight - 80, "F")

    // Logo circle
    doc.setFillColor(59, 130, 246)
    doc.circle(pageWidth / 2, 80, 20, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("HVA", pageWidth / 2, 85, { align: "center" })

    // Title
    doc.setFontSize(28)
    doc.setTextColor(31, 41, 55)
    doc.setFont("helvetica", "bold")
    doc.text("TIPNOW HVA REPORT", pageWidth / 2, 120, { align: "center" })

    // Subtitle
    doc.setFontSize(16)
    doc.setTextColor(107, 114, 128)
    doc.setFont("helvetica", "normal")
    doc.text("Hazard Vulnerability Assessment", pageWidth / 2, 135, { align: "center" })

    // Date
    doc.setFontSize(12)
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 150, { align: "center" })

    // Summary box
    doc.setFillColor(243, 244, 246)
    doc.rect(50, 170, pageWidth - 100, 60, "F")
    doc.setDrawColor(59, 130, 246)
    doc.setLineWidth(1)
    doc.rect(50, 170, pageWidth - 100, 60, "S")

    doc.setFontSize(14)
    doc.setTextColor(31, 41, 55)
    doc.setFont("helvetica", "bold")
    doc.text("Assessment Summary", pageWidth / 2, 185, { align: "center" })

    // Calculate summary statistics
    const totalHazards = assessmentData.filter((h) => h.probability > 0).length
    const totalRiskScore = results.hazardsWithScores.reduce((sum: number, h: any) => sum + (h.score || 0), 0)
    const avgRiskScore = totalHazards > 0 ? (totalRiskScore / totalHazards).toFixed(1) : "0"
    const highRiskHazards = results.hazardsWithScores.filter((h: any) => h.score >= 25).length

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(107, 114, 128)
    doc.text(`Total Hazards Assessed: ${totalHazards}`, 60, 200)
    doc.text(`Average Risk Score: ${avgRiskScore}`, 60, 210)
    doc.text(`High-Risk Hazards: ${highRiskHazards}`, 60, 220)

    addPageNumber()

    // PAGE 2: TOP RISKS CHART
    doc.addPage()

    // Header
    doc.setFillColor(59, 130, 246)
    doc.rect(0, 0, pageWidth, 25, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("Risk Analysis Dashboard", 20, 17)

    // Chart section
    if (results && results.topRisks && results.topRisks.length > 0) {
      let yPos = 40
      doc.setFontSize(16)
      doc.setTextColor(31, 41, 55)
      doc.setFont("helvetica", "bold")
      doc.text("Top 10 Risk Hazards", 20, yPos)

      const chartStartY = yPos + 15
      const chartHeight = 100
      const chartWidth = pageWidth - 40
      const maxScore = Math.max(...results.topRisks.slice(0, 10).map((r: any) => r.score))

      // Chart background
      doc.setFillColor(248, 250, 252)
      doc.rect(20, chartStartY, chartWidth, chartHeight, "F")
      doc.setDrawColor(229, 231, 235)
      doc.setLineWidth(0.5)
      doc.rect(20, chartStartY, chartWidth, chartHeight, "S")

      // Draw bars
      const barColors = [
        [239, 68, 68], // Red
        [245, 101, 101], // Light red
        [251, 146, 60], // Orange
        [252, 176, 64], // Light orange
        [250, 204, 21], // Yellow
        [163, 230, 53], // Light green
        [34, 197, 94], // Green
        [20, 184, 166], // Teal
        [59, 130, 246], // Blue
        [147, 51, 234], // Purple
      ]

      results.topRisks.slice(0, 10).forEach((risk: any, index: number) => {
        if (risk.score && maxScore > 0) {
          const barHeight = (risk.score / maxScore) * (chartHeight - 30)
          const barWidth = (chartWidth - 40) / 10 - 4
          const xPos = 25 + index * (barWidth + 4)
          const yBarPos = chartStartY + chartHeight - 15 - barHeight

          // Draw bar
          const color = barColors[index] || [59, 130, 246]
          doc.setFillColor(color[0], color[1], color[2])
          doc.rect(xPos, yBarPos, barWidth, barHeight, "F")

          // Score label
          doc.setFontSize(8)
          doc.setTextColor(31, 41, 55)
          doc.text(risk.score.toString(), xPos + barWidth / 2, yBarPos - 3, { align: "center" })

          // Hazard name
          const truncatedName = risk.name.length > 10 ? risk.name.substring(0, 10) + "..." : risk.name
          doc.text(truncatedName, xPos + barWidth / 2, chartStartY + chartHeight + 8, {
            align: "center",
            maxWidth: barWidth,
          })
        }
      })

      // AI Insights section
      yPos = chartStartY + chartHeight + 30
      doc.setFillColor(139, 92, 246)
      doc.rect(20, yPos, pageWidth - 40, 8, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("AI-Powered Insights", 25, yPos + 6)

      yPos += 20
      doc.setTextColor(31, 41, 55)
      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")

      const insights = generateAIInsights(results.hazardsWithScores, results.topRisks)
      insights.forEach((insight: string, index: number) => {
        doc.setFillColor(243, 244, 246)
        doc.rect(25, yPos - 2, pageWidth - 50, 12, "F")
        doc.text(`${index + 1}. ${insight}`, 30, yPos + 4, { maxWidth: pageWidth - 60 })
        yPos += 18
      })
    }

    addPageNumber()

    // PAGE 3: DETAILED DATA TABLE
    doc.addPage()

    // Header
    doc.setFillColor(16, 185, 129)
    doc.rect(0, 0, pageWidth, 25, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("Detailed Assessment Data", 20, 17)

    // Prepare table data
    const tableData = assessmentData
      .filter((item) => item.probability > 0)
      .map((item) => [
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

    doc.autoTable({
      startY: 35,
      head: [
        [
          "Hazard",
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
      theme: "striped",
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 8,
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 25, halign: "left" },
        10: { cellWidth: 15, fontStyle: "bold" },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 10, right: 10 },
    })

    addPageNumber()

    return doc.output("blob")
  } catch (error) {
    console.error("PDF Generation Error:", error)
    throw new Error("Failed to generate PDF report. Please try again.")
  }
}

// Helper functions
function generateAIInsights(hazardsWithScores: any[], topRisks: any[]): string[] {
  const insights = []

  const highRiskCount = hazardsWithScores.filter((h) => h.score >= 25).length
  const totalAssessed = hazardsWithScores.filter((h) => h.score > 0).length

  if (highRiskCount > totalAssessed * 0.3) {
    insights.push(
      "High risk exposure detected across multiple categories - comprehensive preparedness review recommended.",
    )
  }

  if (topRisks.length > 0) {
    insights.push(`Primary concern: ${topRisks[0].name} requires immediate attention and resource allocation.`)
  }

  insights.push("Regular assessment updates and staff training will improve overall preparedness scores.")

  return insights.slice(0, 3)
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
