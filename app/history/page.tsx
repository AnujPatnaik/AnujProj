"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, Loader2, Download } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { generateExcel } from "@/lib/excel-generator"
import { generatePDF } from "@/lib/pdf-generator"
import Link from "next/link"

type Assessment = {
  id: string
  assessment_name: string
  created_at: string
  assessment_data: any
  results_data: any
  topHazards: any[]
  totalAssessed: number
}

export default function HistoryPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const { user } = useAuth()
  const [tableExists, setTableExists] = useState(true)

  useEffect(() => {
    if (user) {
      fetchAssessments()
    }
  }, [user])

  const fetchAssessments = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("hva_assessments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5) // Get only the most recent 5 assessments

      if (error) {
        console.error("Error fetching assessments:", error)
        if (error.message.includes("does not exist")) {
          setTableExists(false)
        }
      } else {
        // Process individual assessments (no grouping by date)
        const processedAssessments =
          data?.map((assessment: any) => ({
            id: assessment.id,
            assessment_name: assessment.assessment_name,
            created_at: assessment.created_at,
            assessment_data: assessment.assessment_data,
            results_data: assessment.results_data,
            // Get top 3 hazards for preview
            topHazards: assessment.results_data?.topRisks?.slice(0, 3) || [],
            totalAssessed: assessment.results_data?.hazardsWithScores?.filter((h: any) => h.score > 0).length || 0,
          })) || []

        setAssessments(processedAssessments)
        setTableExists(true)
      }
    } catch (error) {
      console.error("Error:", error)
      setTableExists(false)
    } finally {
      setLoading(false)
    }
  }

  const deleteAssessment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assessment?")) return

    try {
      const { error } = await supabase.from("hva_assessments").delete().eq("id", id)

      if (error) {
        console.error("Error deleting assessment:", error)
        alert("Failed to delete assessment")
      } else {
        setAssessments(assessments.filter((a) => a.id !== id))
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to delete assessment")
    }
  }

  const downloadExcel = async (assessment: Assessment) => {
    setIsGenerating(assessment.id)
    try {
      const blob = generateExcel(assessment.results_data.hazardsWithScores, assessment.results_data)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute(
        "download",
        `${assessment.assessment_name}_${new Date(assessment.created_at).toISOString().split("T")[0]}.xlsx`,
      )
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating Excel:", error)
      alert("Failed to generate Excel file")
    } finally {
      setIsGenerating(null)
    }
  }

  const downloadPDF = async (assessment: Assessment) => {
    setIsGenerating(assessment.id)
    try {
      const blob = await generatePDF(assessment.results_data.hazardsWithScores, assessment.results_data)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute(
        "download",
        `${assessment.assessment_name}_${new Date(assessment.created_at).toISOString().split("T")[0]}.pdf`,
      )
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF file")
    } finally {
      setIsGenerating(null)
    }
  }

  if (!user) {
    return <div>Please log in to view your assessment history.</div>
  }

  if (loading) {
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Assessment History</h1>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Assessment History</h1>
        <p className="text-gray-600">View and manage your previous HVA assessments</p>
      </div>

      {assessments.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
            <p className="text-gray-500 mb-4">Create your first assessment to see it here.</p>
            <Link href="/dashboard">
              <Button>Start New Assessment</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold truncate">{assessment.assessment_name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {new Date(assessment.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Hazards Assessed:</span>
                  <Badge variant="secondary">{assessment.totalAssessed}</Badge>
                </div>

                {assessment.topHazards.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Top Risks:</span>
                    {assessment.topHazards.map((hazard: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 truncate">
                          {index + 1}. {hazard.name}
                        </span>
                        <Badge
                          variant={hazard.score >= 25 ? "destructive" : hazard.score >= 15 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {hazard.score}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadExcel(assessment)}
                    disabled={isGenerating === assessment.id}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadPDF(assessment)}
                    disabled={isGenerating === assessment.id}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteAssessment(assessment.id)}
                  className="w-full"
                >
                  Delete Assessment
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
