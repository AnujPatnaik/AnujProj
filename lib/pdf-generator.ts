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
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  let currentPage = 1

  // Color palette
  const colors = {
    primary: [59, 130, 246], // Blue
    secondary: [16, 185, 129], // Green
    accent: [245, 101, 101], // Red
    warning: [251, 146, 60], // Orange
    info: [139, 92, 246], // Purple
    gray: [107, 114, 128],
    lightGray: [243, 244, 246],
    white: [255, 255, 255],
    dark: [31, 41, 55],
  }

  // Helper function to add page numbers
  const addPageNumber = () => {
    doc.setFontSize(10)
    doc.setTextColor(...colors.gray)
    doc.text(`Page ${currentPage}`, pageWidth - 20, pageHeight - 10)
    currentPage++
  }

  // Helper function to add section divider
  const addSectionDivider = (y: number) => {
    doc.setDrawColor(...colors.primary)
    doc.setLineWidth(0.5)
    doc.line(20, y, pageWidth - 20, y)
  }

  // Helper function to create gradient effect (simulated with multiple rectangles)
  const addSimpleRect = (x: number, y: number, width: number, height: number, color: number[]) => {
    doc.setFillColor(...color)
    doc.rect(x, y, width, height, "F")
  }

  // COVER PAGE
  // Background gradient effect
  addSimpleRect(0, 0, pageWidth, pageHeight, colors.primary)

  // White content area
  doc.setFillColor(...colors.white)
  doc.roundedRect(30, 40, pageWidth - 60, pageHeight - 80, 10, 10, "F")

  // Logo placeholder
  doc.setFillColor(...colors.primary)
  doc.circle(pageWidth / 2, 80, 20, "F")
  doc.setTextColor(...colors.white)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("HVA", pageWidth / 2, 85, { align: "center" })

  // Title
  doc.setFontSize(32)
  doc.setTextColor(...colors.dark)
  doc.setFont("helvetica", "bold")
  doc.text("TIPNOW HVA REPORT", pageWidth / 2, 120, { align: "center" })

  // Subtitle
  doc.setFontSize(18)
  doc.setTextColor(...colors.gray)
  doc.setFont("helvetica", "normal")
  doc.text("Hazard Vulnerability Assessment", pageWidth / 2, 135, { align: "center" })

  // Date and time
  doc.setFontSize(12)
  doc.setTextColor(...colors.gray)
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
  doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 150, { align: "center" })

  // Summary statistics box
  const summaryY = 170
  doc.setFillColor(...colors.lightGray)
  doc.roundedRect(50, summaryY, pageWidth - 100, 60, 5, 5, "F")
  doc.setDrawColor(...colors.primary)
  doc.setLineWidth(1)
  doc.roundedRect(50, summaryY, pageWidth - 100, 60, 5, 5, "S")

  doc.setFontSize(16)
  doc.setTextColor(...colors.dark)
  doc.setFont("helvetica", "bold")
  doc.text("Assessment Overview", pageWidth / 2, summaryY + 15, { align: "center" })

  // Calculate summary statistics
  const totalHazards = assessmentData.filter((h) => h.probability > 0).length
  const totalRiskScore = results.hazardsWithScores.reduce((sum: number, h: any) => sum + (h.score || 0), 0)
  const avgRiskScore = totalHazards > 0 ? (totalRiskScore / totalHazards).toFixed(1) : "0"
  const highRiskHazards = results.hazardsWithScores.filter((h: any) => h.score >= 25).length
  const highRiskPercentage = totalHazards > 0 ? ((highRiskHazards / totalHazards) * 100).toFixed(1) : "0"

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...colors.gray)

  const statsY = summaryY + 30
  doc.text(`Total Hazards Assessed: ${totalHazards}`, 60, statsY)
  doc.text(`Average Risk Score: ${avgRiskScore}`, 60, statsY + 10)
  doc.text(`High-Risk Hazards: ${highRiskHazards} (${highRiskPercentage}%)`, 60, statsY + 20)

  addPageNumber()

  // PAGE 2: EXECUTIVE SUMMARY & INSIGHTS
  doc.addPage()

  // Header
  doc.setFillColor(...colors.primary)
  doc.rect(0, 0, pageWidth, 25, "F")
  doc.setTextColor(...colors.white)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("Executive Summary & AI Insights", 20, 17)

  let yPos = 40

  // AI-Powered Insights Section
  doc.setFillColor(...colors.info)
  doc.roundedRect(15, yPos, pageWidth - 30, 8, 2, 2, "F")
  doc.setTextColor(...colors.white)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("🤖 AI-Powered Risk Analysis", 20, yPos + 6)

  yPos += 20
  doc.setTextColor(...colors.dark)
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")

  // Generate AI insights based on data
  const insights = generateAIInsights(results.hazardsWithScores, results.topRisks)

  doc.text("Based on your assessment data, our AI analysis identifies the following key insights:", 20, yPos)
  yPos += 15

  insights.forEach((insight: string, index: number) => {
    doc.setFillColor(...colors.lightGray)
    doc.roundedRect(20, yPos - 3, pageWidth - 40, 12, 2, 2, "F")
    doc.setTextColor(...colors.dark)
    doc.text(`${index + 1}. ${insight}`, 25, yPos + 4)
    yPos += 20
  })

  // Recommended Actions
  yPos += 10
  doc.setFillColor(...colors.secondary)
  doc.roundedRect(15, yPos, pageWidth - 30, 8, 2, 2, "F")
  doc.setTextColor(...colors.white)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("📋 Priority Action Items", 20, yPos + 6)

  yPos += 20
  const actions = generateRecommendedActions(results.topRisks)

  actions.forEach((action: string, index: number) => {
    doc.setFillColor(index === 0 ? [254, 226, 226] : index === 1 ? [255, 237, 213] : [220, 252, 231])
    doc.roundedRect(20, yPos - 3, pageWidth - 40, 15, 2, 2, "F")
    doc.setTextColor(...colors.dark)
    doc.setFont("helvetica", "bold")
    doc.text(`Priority ${index + 1}:`, 25, yPos + 4)
    doc.setFont("helvetica", "normal")
    doc.text(action, 25, yPos + 10)
    yPos += 22
  })

  addPageNumber()

  // PAGE 3: VISUAL ANALYTICS
  doc.addPage()

  // Header
  doc.setFillColor(...colors.accent)
  doc.rect(0, 0, pageWidth, 25, "F")
  doc.setTextColor(...colors.white)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("Risk Analytics Dashboard", 20, 17)

  // Top 10 Risks Bar Chart
  if (results && results.topRisks && results.topRisks.length > 0) {
    yPos = 40
    doc.setFontSize(14)
    doc.setTextColor(...colors.dark)
    doc.setFont("helvetica", "bold")
    doc.text("Top 10 Risk Hazards", 20, yPos)

    const chartStartY = yPos + 10
    const chartHeight = 80
    const chartWidth = pageWidth - 40
    const maxScore = Math.max(...results.topRisks.slice(0, 10).map((r: any) => r.score))

    // Chart background
    doc.setFillColor(...colors.lightGray)
    doc.roundedRect(20, chartStartY, chartWidth, chartHeight, 3, 3, "F")

    // Draw bars with gradient colors
    const barColors = [
      [239, 68, 68],
      [245, 101, 101],
      [251, 146, 60],
      [252, 176, 64],
      [250, 204, 21],
      [163, 230, 53],
      [34, 197, 94],
      [20, 184, 166],
      [59, 130, 246],
      [147, 51, 234],
    ]

    results.topRisks.slice(0, 10).forEach((risk: any, index: number) => {
      const barHeight = (risk.score / maxScore) * (chartHeight - 20)
      const barWidth = (chartWidth - 40) / 10 - 2
      const xPos = 25 + index * (barWidth + 2)
      const yBarPos = chartStartY + chartHeight - 10 - barHeight

      // Simple colored bar instead of gradient
      const color = barColors[index] || colors.primary
      doc.setFillColor(...color)
      doc.rect(xPos, yBarPos, barWidth, barHeight, "F")

      // Score label on top
      doc.setFontSize(8)
      doc.setTextColor(...colors.dark)
      doc.text(risk.score.toString(), xPos + barWidth / 2, yBarPos - 2, { align: "center" })

      // Hazard name
      doc.text(
        risk.name.length > 8 ? risk.name.substring(0, 8) + "..." : risk.name,
        xPos + barWidth / 2,
        chartStartY + chartHeight + 8,
        { align: "center" },
      )
    })

    // Risk Distribution Pie Chart
    yPos = chartStartY + chartHeight + 30
    doc.setFontSize(14)
    doc.setTextColor(...colors.dark)
    doc.setFont("helvetica", "bold")
    doc.text("Risk Distribution", 20, yPos)

    const pieChartY = yPos + 15
    const pieRadius = 25
    const pieCenterX = 60
    const pieCenterY = pieChartY + pieRadius

    // Calculate risk distribution
    const lowRisk = results.hazardsWithScores.filter((h: any) => h.score > 0 && h.score < 15).length
    const mediumRisk = results.hazardsWithScores.filter((h: any) => h.score >= 15 && h.score < 25).length
    const highRisk = results.hazardsWithScores.filter((h: any) => h.score >= 25).length
    const total = lowRisk + mediumRisk + highRisk

    if (total > 0) {
      const startAngle = 0
      const segments = [
        { value: lowRisk, color: colors.secondary, label: "Low Risk" },
        { value: mediumRisk, color: colors.warning, label: "Medium Risk" },
        { value: highRisk, color: colors.accent, label: "High Risk" },
      ]

      segments.forEach((segment, index) => {
        if (segment.value > 0) {
          const angle = (segment.value / total) * 360

          // Draw pie segment (simplified as rectangles for jsPDF limitations)
          doc.setFillColor(...segment.color)
          const segmentHeight = (segment.value / total) * 40
          doc.rect(pieCenterX + index * 15, pieCenterY, 12, segmentHeight, "F")

          // Legend
          doc.setFillColor(...segment.color)
          doc.rect(120, pieChartY + index * 15, 8, 8, "F")
          doc.setTextColor(...colors.dark)
          doc.setFontSize(10)
          doc.text(
            `${segment.label}: ${segment.value} (${((segment.value / total) * 100).toFixed(1)}%)`,
            135,
            pieChartY + index * 15 + 6,
          )
        }
      })
    }
  }

  addPageNumber()

  // PAGE 4: DETAILED DATA TABLE
  doc.addPage()

  // Header
  doc.setFillColor(...colors.secondary)
  doc.rect(0, 0, pageWidth, 25, "F")
  doc.setTextColor(...colors.white)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("Detailed Assessment Data", 20, 17)

  // Prepare data for the comprehensive table
  const tableData = assessmentData.map((item) => [
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
      fillColor: colors.secondary,
      textColor: colors.white,
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 25, halign: "left" }, // Hazard name
      10: { cellWidth: 15, fontStyle: "bold" }, // Risk Score
    },
    alternateRowStyles: {
      fillColor: colors.lightGray,
    },
    margin: { left: 10, right: 10 },
    didParseCell: (data) => {
      // Highlight high-risk scores
      if (data.column.index === 10 && Number.parseInt(data.cell.text[0]) >= 25) {
        data.cell.styles.fillColor = [254, 226, 226]
        data.cell.styles.textColor = [185, 28, 28]
        data.cell.styles.fontStyle = "bold"
      }
    },
  })

  addPageNumber()

  // PAGE 5: RECOMMENDATIONS & NEXT STEPS
  doc.addPage()

  // Header
  doc.setFillColor(...colors.info)
  doc.rect(0, 0, pageWidth, 25, "F")
  doc.setTextColor(...colors.white)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("Recommendations & Next Steps", 20, 17)

  yPos = 40

  // Implementation Timeline
  doc.setFillColor(...colors.warning)
  doc.roundedRect(15, yPos, pageWidth - 30, 8, 2, 2, "F")
  doc.setTextColor(...colors.white)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("📅 Implementation Timeline", 20, yPos + 6)

  yPos += 20
  const timeline = [
    { period: "Immediate (0-30 days)", actions: "Address top 3 critical risks, emergency supply check" },
    { period: "Short-term (1-3 months)", actions: "Staff training, equipment upgrades, policy updates" },
    { period: "Medium-term (3-6 months)", actions: "System improvements, partnership agreements" },
    { period: "Long-term (6-12 months)", actions: "Infrastructure upgrades, comprehensive drills" },
  ]

  timeline.forEach((item, index) => {
    doc.setFillColor(...colors.lightGray)
    doc.roundedRect(20, yPos - 3, pageWidth - 40, 18, 2, 2, "F")
    doc.setTextColor(...colors.dark)
    doc.setFont("helvetica", "bold")
    doc.text(item.period, 25, yPos + 4)
    doc.setFont("helvetica", "normal")
    doc.text(item.actions, 25, yPos + 12)
    yPos += 25
  })

  // Contact Information
  yPos += 20
  doc.setFillColor(...colors.primary)
  doc.roundedRect(15, yPos, pageWidth - 30, 8, 2, 2, "F")
  doc.setTextColor(...colors.white)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("📞 Support & Resources", 20, yPos + 6)

  yPos += 20
  doc.setTextColor(...colors.dark)
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text("For additional support and resources:", 20, yPos)
  doc.text("• Emergency Management Consultation", 25, yPos + 12)
  doc.text("• Training Program Development", 25, yPos + 20)
  doc.text("• Technology Implementation Support", 25, yPos + 28)

  addPageNumber()

  return doc.output("blob")
}

// AI Insights Generation
function generateAIInsights(hazardsWithScores: any[], topRisks: any[]): string[] {
  const insights = []

  // Analyze risk patterns
  const highRiskCount = hazardsWithScores.filter((h) => h.score >= 25).length
  const totalAssessed = hazardsWithScores.filter((h) => h.score > 0).length

  if (highRiskCount > totalAssessed * 0.3) {
    insights.push(
      "Your facility shows elevated risk exposure across multiple hazard categories, indicating need for comprehensive preparedness enhancement.",
    )
  }

  // Analyze top risk categories
  const naturalRisks = topRisks.filter(
    (r: any) => r.name.includes("Earthquake") || r.name.includes("Flood") || r.name.includes("Hurricane"),
  )
  const techRisks = topRisks.filter(
    (r: any) => r.name.includes("Power") || r.name.includes("IT") || r.name.includes("System"),
  )

  if (naturalRisks.length > 0) {
    insights.push(
      "Natural hazards represent significant risks - consider geographic-specific emergency protocols and backup systems.",
    )
  }

  if (techRisks.length > 0) {
    insights.push(
      "Technology-related vulnerabilities detected - infrastructure redundancy and IT disaster recovery plans are critical.",
    )
  }

  // Default insight if none generated
  if (insights.length === 0) {
    insights.push(
      "Assessment shows manageable risk levels with opportunities for targeted improvements in high-scoring areas.",
    )
  }

  return insights.slice(0, 3)
}

// Recommended Actions Generation
function generateRecommendedActions(topRisks: any[]): string[] {
  const actions = []

  if (topRisks.length > 0) {
    actions.push(
      `Immediate focus on ${topRisks[0].name} mitigation - develop specific response protocols and resource allocation.`,
    )
  }

  if (topRisks.length > 1) {
    actions.push(`Enhance preparedness for ${topRisks[1].name} through staff training and equipment procurement.`)
  }

  actions.push("Establish quarterly risk assessment reviews and update emergency response plans based on findings.")

  return actions
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
