"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Shield, Users, BarChart3 } from "lucide-react"

export default function PricingPage() {
  const plans = [
    {
      name: "Basic",
      price: "$29",
      period: "/month",
      description: "Perfect for small healthcare facilities",
      features: [
        "Up to 5 assessments per month",
        "Basic PDF reports",
        "Email support",
        "Standard hazard database",
        "Basic analytics",
      ],
      icon: Shield,
      popular: false,
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "Ideal for medium-sized organizations",
      features: [
        "Unlimited assessments",
        "Enhanced PDF reports with charts",
        "Priority email & phone support",
        "Custom hazard categories",
        "Advanced analytics dashboard",
        "Team collaboration tools",
        "Historical trend analysis",
      ],
      icon: Zap,
      popular: true,
      buttonText: "Start Free Trial",
      buttonVariant: "default" as const,
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      description: "For large healthcare systems",
      features: [
        "Everything in Professional",
        "Multi-facility management",
        "Custom branding",
        "API access",
        "Dedicated account manager",
        "On-site training",
        "Custom integrations",
        "Compliance reporting",
        "24/7 phone support",
      ],
      icon: Users,
      popular: false,
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
    },
  ]

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 mb-8">
          Comprehensive hazard vulnerability assessment tools for healthcare facilities of all sizes
        </p>

        {/* Feature highlights */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="flex items-center gap-3 justify-center">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <span className="text-lg font-medium">Advanced Analytics</span>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <Shield className="h-8 w-8 text-green-600" />
            <span className="text-lg font-medium">HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <Users className="h-8 w-8 text-purple-600" />
            <span className="text-lg font-medium">Team Collaboration</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative shadow-xl transition-all duration-300 hover:shadow-2xl ${
              plan.popular ? "border-2 border-blue-500 scale-105" : "border-0"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-4 py-1 flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <plan.icon className={`h-12 w-12 ${plan.popular ? "text-blue-600" : "text-gray-600"}`} />
              </div>
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-500">{plan.period}</span>
              </div>
              <p className="text-gray-600 mt-2">{plan.description}</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.buttonVariant}
                className={`w-full py-3 ${plan.popular ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                size="lg"
              >
                {plan.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 text-sm">
                Yes! Professional plan includes a 14-day free trial with full access to all features.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600 text-sm">
                Absolutely. You can upgrade or downgrade your plan at any time with prorated billing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is my data secure?</h3>
              <p className="text-gray-600 text-sm">
                Yes, we're HIPAA compliant with enterprise-grade security and encryption.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do you offer training?</h3>
              <p className="text-gray-600 text-sm">
                Professional plans include online training, Enterprise includes on-site training.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact CTA */}
      <div className="text-center mt-12 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Need a Custom Solution?</h2>
        <p className="text-gray-600 mb-6">Contact our team to discuss enterprise pricing and custom implementations.</p>
        <Button size="lg" className="px-8">
          Contact Sales Team
        </Button>
      </div>
    </div>
  )
}
