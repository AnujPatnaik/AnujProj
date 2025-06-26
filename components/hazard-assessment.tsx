"use client"

import { useState } from "react"
import {
  Download,
  FileSpreadsheet,
  Calculator,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Save,
  Info,
  FileText,
  Lightbulb,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { calculateRiskScores } from "@/lib/calculate-risk"
import { hazardData } from "@/lib/hazard-data"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import HazardTable from "@/components/HazardTable"

export function HazardAssessment() {
  const [assessmentData, setAssessmentData] = useState(hazardData)
  const [results, setResults] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [assessmentName, setAssessmentName] = useState<string>("")
  const [saveMessage, setSaveMessage] = useState<string>("")
  const { user } = useAuth()

  const handleCalculate = async () => {
    console.log("Calculating risk scores...")
    const calculatedResults = calculateRiskScores(assessmentData)
    console.log("Calculated results:", calculatedResults)
    setResults(calculatedResults)

    // Auto-save if user is logged in
    if (user) {
      await saveAssessment(calculatedResults, true)
    }
  }

  const saveAssessment = async (calculatedResults?: any, isAutoSave = false) => {
    if (!user) {
      if (!isAutoSave) {
        setSaveMessage("Please log in to save assessments")
        setTimeout(() => setSaveMessage(""), 3000)
      }
      return
    }

    setIsSaving(true)
    if (!isAutoSave) setSaveMessage("")

    try {
      const resultsToSave = calculatedResults || results
      const name = assessmentName.trim() || `Assessment ${new Date().toLocaleDateString()}`

      const { error } = await supabase.from("hva_assessments").insert({
        user_id: user.id,
        assessment_name: name,
        assessment_data: assessmentData,
        results_data: resultsToSave,
      })

      if (error) {
        console.error("Save error:", error)
        if (!isAutoSave) {
          setSaveMessage(`Error saving: ${error.message}`)
        }
      } else {
        if (!isAutoSave) {
          setSaveMessage("Assessment saved successfully!")
          setAssessmentName("")
          setTimeout(() => setSaveMessage(""), 3000)
        }
      }
    } catch (error) {
      console.error("Unexpected save error:", error)
      if (!isAutoSave) {
        setSaveMessage("Error saving assessment")
        setTimeout(() => setSaveMessage(""), 3000)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadExcel = async () => {
    if (!results) return

    try {
      setIsGenerating(true)
      // Use the simple Excel generator
      const { generateExcel } = await import("@/lib/excel-generator-simple")
      const blob = generateExcel(results.hazardsWithScores, results)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `TIPNOW_HVA_Simple_${new Date().toISOString().split("T")[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating Excel:", error)
      alert("Failed to generate Excel file. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!results) return

    try {
      setIsGenerating(true)
      // Use the Kaiser-style PDF generator
      const { generatePDF } = await import("@/lib/pdf-generator-kaiser-style")
      const blob = await generatePDF(results.hazardsWithScores, results)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `TIPNOW_HVA_Report_${new Date().toISOString().split("T")[0]}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF report. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate intelligent analysis based on assessment data
  const generateAnalysis = () => {
    if (!results || !results.topRisks) return null

    const topRisks = results.topRisks.slice(0, 5)
    const highRisks = topRisks.filter((risk: any) => risk.score >= 25)
    const mediumRisks = topRisks.filter((risk: any) => risk.score >= 15 && risk.score < 25)
    const assessedHazards = assessmentData.filter((h) => h.probability > 0)

    // Categorize hazards by type
    const naturalHazards = assessedHazards.filter((h) => h.category === "Natural")
    const technologicalHazards = assessedHazards.filter((h) => h.category === "Technological")
    const humanHazards = assessedHazards.filter((h) => h.category === "Human-Related")

    const analysis = {
      overview: `This Hazard Vulnerability Assessment analyzed ${assessmentData.length} potential hazards, with ${assessedHazards.length} hazards identified as applicable to your facility. The assessment reveals ${highRisks.length} high-risk hazards (score ≥25) and ${mediumRisks.length} medium-risk hazards (score 15-24) that require immediate attention and resource allocation.`,

      riskProfile:
        highRisks.length > 0
          ? `Your facility faces significant risk exposure, with ${highRisks[0].name} presenting the highest threat (Risk Score: ${highRisks[0].score}). This indicates a critical need for enhanced preparedness measures and immediate mitigation strategies.`
          : mediumRisks.length > 0
            ? `Your facility maintains a moderate risk profile, with ${topRisks[0].name} as the primary concern (Risk Score: ${topRisks[0].score}). While no critical threats were identified, continued vigilance and preparedness improvements are recommended.`
            : "Your facility demonstrates excellent risk management with no high-priority threats identified. Continue maintaining current preparedness standards.",

      categoryAnalysis: `Risk distribution analysis shows: ${naturalHazards.length} natural hazards, ${technologicalHazards.length} technological hazards, and ${humanHazards.length} human-related hazards are applicable to your facility. ${
        naturalHazards.length > technologicalHazards.length && naturalHazards.length > humanHazards.length
          ? "Natural hazards represent your primary risk category, suggesting the need for weather monitoring systems and environmental preparedness protocols."
          : technologicalHazards.length > humanHazards.length
            ? "Technological hazards dominate your risk profile, indicating the importance of infrastructure maintenance and backup systems."
            : "Human-related hazards are your primary concern, emphasizing the need for security measures and staff training programs."
      }`,

      recommendations: [
        highRisks.length > 0
          ? `Immediate Action Required: Develop comprehensive emergency response plans for ${highRisks[0].name}, including staff training, resource allocation, and communication protocols.`
          : "Maintain current preparedness levels and conduct regular drills to ensure readiness.",

        `Resource Prioritization: Focus emergency preparedness investments on the top 3 identified risks: ${topRisks
          .slice(0, 3)
          .map((r: any) => r.name)
          .join(", ")}.`,

        assessedHazards.some((h) => h.preparedness < 2)
          ? "Preparedness Gap: Several hazards show inadequate preparedness scores. Implement training programs and resource acquisition to address these vulnerabilities."
          : "Preparedness Strength: Your facility demonstrates good preparedness across assessed hazards. Continue regular updates and training.",

        "Annual Review: Conduct this assessment annually or after significant operational changes to maintain current risk awareness and preparedness levels.",
      ],

      keyFindings: [
        `Highest Risk: ${topRisks[0].name} (Score: ${topRisks[0].score})`,
        `Total Applicable Hazards: ${assessedHazards.length} of ${assessmentData.length}`,
        `Risk Categories: ${naturalHazards.length} Natural, ${technologicalHazards.length} Technological, ${humanHazards.length} Human-Related`,
        `Assessment Completion: ${((assessedHazards.length / assessmentData.length) * 100).toFixed(0)}% of hazards evaluated`,
      ],
    }

    return analysis
  }

  // Calculate progress statistics
  const totalHazards = assessmentData.length
  const assessedHazards = assessmentData.filter((h) => h.probability > 0).length
  const progressPercentage = (assessedHazards / totalHazards) * 100

  // Prepare chart data - ensure it's always valid
  const chartData =
    results?.topRisks?.length > 0
      ? results.topRisks.slice(0, 10).map((risk: any) => ({
          name: risk.name.length > 15 ? risk.name.substring(0, 15) + "..." : risk.name,
          score: Number(risk.score) || 0,
          fullName: risk.name,
        }))
      : []

  const analysis = generateAnalysis()

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Hazard Vulnerability Assessment</h1>
            <p className="text-blue-100 text-lg">TIPNOW Format - Comprehensive Risk Analysis</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-end">
            <div className="text-right">
              <div className="text-2xl font-bold">
                {assessedHazards}/{totalHazards}
              </div>
              <div className="text-blue-200 text-sm">Hazards Assessed</div>
            </div>
            <Progress value={progressPercentage} className="w-32 mt-2" />
          </div>
        </div>
      </div>

      {/* Instructions Section */}
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Info className="h-6 w-6 text-amber-600" />
            Instructions for Completing the HVA
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="prose max-w-none">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-blue-800 font-medium mb-2">
                <strong>Important:</strong> This HVA tool is a comprehensive risk assessment document. Complete it as it
                pertains to your specific facility and operational environment.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Assessment Process
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Review each hazard category (Natural, Technological, Human-Related)</li>
                  <li>
                    For each relevant hazard, assess the <strong>Probability</strong> (0-3 scale)
                  </li>
                  <li>
                    Enter historical <strong>Alerts</strong> and <strong>Activations</strong> data
                  </li>
                  <li>
                    Evaluate potential <strong>Impact</strong> across Human, Property, and Business domains
                  </li>
                  <li>
                    Assess your organization's <strong>Response Capability</strong>
                  </li>
                  <li>Click "Calculate Risk Scores" to generate your risk analysis</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-green-600" />
                  Scoring Guidelines
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong className="text-blue-700">Probability Scale:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>
                        • <strong>0 (N/A):</strong> Not applicable to your facility
                      </li>
                      <li>
                        • <strong>1 (Low):</strong> Unlikely to occur
                      </li>
                      <li>
                        • <strong>2 (Moderate):</strong> Possible occurrence
                      </li>
                      <li>
                        • <strong>3 (High):</strong> Likely to occur
                      </li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-orange-700">Impact & Response:</strong>
                    <p className="ml-4 mt-1">
                      Rate from 0 (N/A) to 3 (High/Good) based on potential severity and your preparedness level.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Considerations</h3>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">PROBABILITY Factors:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Known historical risk patterns</li>
                    <li>• Geographic and environmental factors</li>
                    <li>• Seasonal or cyclical patterns</li>
                    <li>• Regional vulnerability assessments</li>
                    <li>• Expert predictions and forecasts</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-orange-700 mb-2">IMPACT Considerations:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>
                      <strong>Human:</strong> Staff, patient, visitor safety
                    </li>
                    <li>
                      <strong>Property:</strong> Replacement and repair costs
                    </li>
                    <li>
                      <strong>Business:</strong> Operational disruption
                    </li>
                    <li>• Revenue loss potential</li>
                    <li>• Regulatory compliance issues</li>
                    <li>• Reputation and public image</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-green-700 mb-2">RESPONSE Capabilities:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>
                      <strong>Preparedness:</strong> Plans, training, drills
                    </li>
                    <li>
                      <strong>Internal:</strong> Staff, supplies, resources
                    </li>
                    <li>
                      <strong>External:</strong> Community partnerships
                    </li>
                    <li>• Emergency supply availability</li>
                    <li>• Backup system functionality</li>
                    <li>• Communication protocols</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Best Practices
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Involve multidisciplinary team members in the assessment process</li>
                <li>• Review and update assessments annually or after significant incidents</li>
                <li>• Use historical data from the past 10 years when available</li>
                <li>• Consider worst-case scenarios during peak operational periods</li>
                <li>• Document assumptions and rationale for future reference</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Name Input */}
      {user && (
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-3">
              <Save className="h-5 w-5 text-purple-600" />
              Assessment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="assessment-name">Assessment Name (Optional)</Label>
                <Input
                  id="assessment-name"
                  placeholder="Enter a name for this assessment..."
                  value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                  className="mt-1"
                />
              </div>
              {results && (
                <Button onClick={() => saveAssessment()} disabled={isSaving} variant="outline">
                  {isSaving ? "Saving..." : "Save Assessment"}
                </Button>
              )}
            </div>
            {saveMessage && (
              <div
                className={`mt-3 p-2 rounded text-sm ${
                  saveMessage.includes("Error") || saveMessage.includes("Failed")
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {saveMessage}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assessment Form */}
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Calculator className="h-6 w-6 text-blue-600" />
            Assessment Form
            <Badge variant="outline" className="ml-auto">
              {progressPercentage.toFixed(0)}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Stable container to prevent layout shifts */}
          <div className="min-h-[800px]">
            <HazardTable data={assessmentData} setData={setAssessmentData} />

            {/* Fixed height container for submit button to prevent layout shifts */}
            <div className="mt-8 h-20 flex items-center justify-center">
              <Button size="lg" onClick={handleCalculate} className="px-8 py-3 text-lg font-semibold">
                <TrendingUp className="mr-2 h-5 w-5" />
                Calculate Risk Scores
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  Top Risk Hazards
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {chartData.length > 0 ? (
                  <div className="space-y-4">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900">Risk Score Visualization</h3>

                    {/* Custom Horizontal Bar Chart */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <div className="space-y-3">
                        {chartData.map((risk: any, index: number) => {
                          const maxScore = Math.max(...chartData.map((r: any) => r.score))
                          const barWidth = (risk.score / maxScore) * 100

                          // Color palette matching PDF
                          const colors = [
                            "bg-red-500", // Red for highest risk
                            "bg-yellow-500", // Yellow/Orange
                            "bg-orange-500", // Orange
                            "bg-yellow-400", // Light Orange
                            "bg-lime-500", // Light Green
                            "bg-green-500", // Green
                            "bg-cyan-500", // Cyan/Blue
                            "bg-blue-500", // Blue
                            "bg-purple-500", // Purple
                            "bg-pink-500", // Pink
                          ]

                          const barColor = colors[index] || "bg-blue-500"

                          return (
                            <div key={risk.name} className="space-y-1">
                              {/* Hazard name */}
                              <div className="flex justify-between items-center">
                                <span
                                  className="text-sm font-medium text-gray-700 truncate max-w-xs"
                                  title={risk.fullName}
                                >
                                  {risk.name}
                                </span>
                                <span className="text-sm font-bold text-gray-900 ml-2">{risk.score}</span>
                              </div>

                              {/* Bar */}
                              <div className="relative bg-gray-200 rounded-full h-8 overflow-hidden">
                                <div
                                  className={`${barColor} h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2`}
                                  style={{ width: `${barWidth}%` }}
                                >
                                  <span className="text-white text-xs font-bold">{risk.score}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Legend */}
                      <div className="mt-6 pt-4 border-t border-gray-300">
                        <div className="flex flex-wrap gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span>High Risk (≥25)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                            <span>Medium Risk (15-24)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>Low Risk (&lt;15)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">No Risk Data Available</p>
                      <p className="text-sm">Complete the assessment and calculate risk scores to view the chart.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Section */}
          <div className="space-y-6">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Assessment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {results.topRisks && results.topRisks.length > 0 ? (
                  <>
                    <div>
                      <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Priority Actions Required:
                      </h4>
                      <ul className="space-y-2">
                        {results.topRisks.slice(0, 3).map((risk: any, index: number) => (
                          <li key={risk.name} className="flex items-start gap-2">
                            <Badge variant="destructive" className="text-xs">
                              {index + 1}
                            </Badge>
                            <span className="text-sm">{risk.name}</span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              {risk.score}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-blue-700 mb-3">Resource Priorities:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Emergency response equipment
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Staff training programs
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Communication systems
                        </li>
                      </ul>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold text-green-700 mb-2">Overall Preparedness:</h4>
                      <p className="text-sm text-gray-700">{results.overallPreparedness || "Good"}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Complete the assessment to view summary</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Export Section */}
            {results && results.topRisks && results.topRisks.length > 0 && (
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                  <CardTitle className="text-lg">Export Reports</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Button
                    variant="outline"
                    onClick={handleDownloadExcel}
                    disabled={isGenerating}
                    className="w-full justify-start"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                    {isGenerating ? "Generating..." : "Download Excel (.xlsx)"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    className="w-full justify-start"
                  >
                    <Download className="mr-2 h-4 w-4 text-red-600" />
                    {isGenerating ? "Generating..." : "Download PDF Report"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Risk Analysis & Recommendations Section */}
      {results && analysis && (
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <FileText className="h-6 w-6 text-indigo-600" />
              Risk Analysis & Professional Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Executive Summary */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Executive Summary
                </h3>
                <p className="text-gray-700 leading-relaxed">{analysis.overview}</p>
              </div>

              {/* Risk Profile Analysis */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  Risk Profile Analysis
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">{analysis.riskProfile}</p>
                <p className="text-gray-700 leading-relaxed">{analysis.categoryAnalysis}</p>
              </div>

              {/* Key Findings */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Key Findings
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {analysis.keyFindings.map((finding, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm">{finding}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Recommendations */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Professional Recommendations
                </h3>
                <div className="space-y-4">
                  {analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                      <p className="text-gray-800 font-medium">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Recommended Next Steps
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-green-700">
                  <li>Review and validate assessment results with your emergency management team</li>
                  <li>Prioritize resource allocation based on identified high-risk hazards</li>
                  <li>Develop or update emergency response plans for top-priority risks</li>
                  <li>Schedule regular training and drills for identified scenarios</li>
                  <li>Establish monitoring systems for early warning and detection</li>
                  <li>Plan for annual reassessment and continuous improvement</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
