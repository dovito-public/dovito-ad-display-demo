"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CheckoutSuccess() {
  const [plan, setPlan] = useState("");
  const [billingInterval, setBillingInterval] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setPlan(urlParams.get('plan') || 'starter');
    setBillingInterval(urlParams.get('billing') || 'month');
  }, []);

  const planDetails = {
    starter: { name: "Starter", slides: 1, impressions: 1920, price: { month: 200, year: 2000 } },
    growth: { name: "Growth", slides: 2, impressions: 3840, price: { month: 350, year: 3500 } },
    premium: { name: "Premium", slides: 3, impressions: 5760, price: { month: 500, year: 5000 } }
  };

  const currentPlan = planDetails[plan as keyof typeof planDetails];
  const amount = currentPlan?.price[billingInterval as 'month' | 'year'] || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </CardTitle>
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span className="text-lg text-gray-600">Welcome to Dovito Advertising</span>
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <Badge variant="secondary" className="mr-2">{currentPlan?.name}</Badge>
              Plan Activated
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="font-semibold">{currentPlan?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount Paid</p>
                <p className="font-semibold">${amount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Billing</p>
                <p className="font-semibold capitalize">{billingInterval}ly</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-emerald-600">Active</p>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">What's included in your plan:</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <span>{currentPlan?.slides} advertising slide{currentPlan?.slides > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <span>{currentPlan?.impressions.toLocaleString()} monthly impressions</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <span>Professional design included</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <span>QR code integration</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <span>Analytics dashboard</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-3">Next Steps:</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>1. Submit your advertisement design through our application form</p>
              <p>2. Our team will review and approve your submission within 24 hours</p>
              <p>3. Once approved, your ad will go live on our Main Street display</p>
              <p>4. Track your campaign performance through your dashboard</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link href="/apply" className="flex-1">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Submit Your Advertisement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Support */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Need help? Contact us at{" "}
              <a href="mailto:support@dovito.com" className="text-blue-600 hover:underline">
                support@dovito.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
