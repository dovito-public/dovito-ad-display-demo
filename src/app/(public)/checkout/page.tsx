"use client";

import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ExternalLink } from "lucide-react";

export default function Checkout() {
  const [selectedBilling, setSelectedBilling] = useState("month");
  const { toast } = useToast();

  const pricingPlans = [
    {
      name: "Starter",
      key: "starter",
      slides: 1,
      monthly: 160,
      annual: 1600,
      impressions: 7600,
      stripeLinks: {
        monthly: "https://buy.stripe.com/price_1RnjL5IV9P552TYjmjQGtFdu",
        annual: "https://buy.stripe.com/price_1RnjMUIV9P552TYjc6HzkNG1"
      },
      features: [
        "1 advertising slide",
        "7,600 monthly impressions",
        "Professional design included",
        "Analytics dashboard"
      ]
    },
    {
      name: "Growth",
      key: "growth",
      slides: 2,
      monthly: 300,
      annual: 3000,
      impressions: 15200,
      popular: true,
      stripeLinks: {
        monthly: "https://buy.stripe.com/price_1Rfr2uIV9P552TYjXVTFYI5B",
        annual: "https://buy.stripe.com/price_1Rfr2uIV9P552TYjlElRuMTY"
      },
      features: [
        "2 advertising slides",
        "15,200 monthly impressions",
        "Professional design included",
        "Analytics dashboard",
        "Priority support"
      ]
    },
    {
      name: "Premium",
      key: "premium",
      slides: 3,
      monthly: 420,
      annual: 4200,
      impressions: 22800,
      stripeLinks: {
        monthly: "https://buy.stripe.com/price_1Rfr2uIV9P552TYj2yuRe9jd",
        annual: "https://buy.stripe.com/price_1Rfr2uIV9P552TYjvAUBiMrn"
      },
      features: [
        "3 advertising slides (max)",
        "22,800 monthly impressions",
        "Professional design included",
        "Analytics dashboard",
        "Priority support",
        "Custom design revisions"
      ]
    }
  ];

  const getEffectivePrice = (plan: typeof pricingPlans[0]) => {
    return selectedBilling === "month"
      ? plan.monthly
      : Math.round(plan.annual / 12);
  };

  const handleCheckout = (plan: typeof pricingPlans[0]) => {
    const stripeLink = selectedBilling === "month"
      ? plan.stripeLinks.monthly
      : plan.stripeLinks.annual;

    // Open Stripe checkout in same window
    window.location.href = stripeLink;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Advertising Plan</h1>
          <p className="text-xl text-gray-600">
            Get your business seen on Main Street Windsor
          </p>

        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <Card className="p-1">
            <div className="flex items-center">
              <Button
                variant={selectedBilling === "month" ? "default" : "ghost"}
                onClick={() => setSelectedBilling("month")}
                className="px-6 py-2 rounded-md font-medium"
              >
                Monthly
              </Button>
              <Button
                variant={selectedBilling === "year" ? "default" : "ghost"}
                onClick={() => setSelectedBilling("year")}
                className="px-6 py-2 rounded-md font-medium relative"
              >
                Annual
                <Badge className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs">
                  Save 16.7%
                </Badge>
              </Button>
            </div>
          </Card>
        </div>

        {/* Plan Selection */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-8">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative transition-all hover:shadow-lg ${plan.popular ? 'border-2 border-blue-500 transform scale-105' : 'border-2 border-gray-100'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-2">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    ${getEffectivePrice(plan)}
                  </div>
                  <div className="text-gray-500">per month</div>
                  {selectedBilling === "year" && (
                    <div className="text-sm text-emerald-600 font-medium mt-1">
                      ${plan.annual.toLocaleString()} billed annually
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleCheckout(plan)}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Secure Checkout - ${getEffectivePrice(plan)}/mo
                </Button>

                <p className="text-xs text-gray-500 text-center mt-2">
                  Redirects to secure Stripe checkout
                </p>
              </CardContent>
            </Card>
          ))}
        </div>


      </div>
    </div>
  );
}
