"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Rocket } from "lucide-react";

export default function MarketingCalculator() {
  const [selectedSlides, setSelectedSlides] = useState(1);
  const [billingPlan, setBillingPlan] = useState<"monthly" | "annual">("monthly");

  // Fetch display settings for dynamic calculations
  const { data: displaySettings = [] } = useQuery({
    queryKey: ['/api/display-settings'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const pricingData = {
    monthly: { 1: 160, 2: 300, 3: 420 },
    annual: { 1: 1600, 2: 3000, 3: 4200 }
  };

  // Get dynamic settings from admin panel (moved outside to be accessible in JSX)
  const totalSlidesInRotation = parseInt((displaySettings as any[]).find((s: any) => s.setting_key === 'totalSlides')?.setting_value || '30');
  const slideIntervalSeconds = parseInt((displaySettings as any[]).find((s: any) => s.setting_key === 'slideInterval')?.setting_value || '15');
  const dailyOperatingHours = parseInt((displaySettings as any[]).find((s: any) => s.setting_key === 'operatingHours')?.setting_value || '16');
  const operatingStartTime = (displaySettings as any[]).find((s: any) => s.setting_key === 'operatingStartTime')?.setting_value || '06:00';

  const calculateMetrics = () => {

    const monthlyPrice = pricingData.monthly[selectedSlides as keyof typeof pricingData.monthly];
    const annualPrice = pricingData.annual[selectedSlides as keyof typeof pricingData.annual];
    const effectiveMonthly = billingPlan === "monthly" ? monthlyPrice : Math.round(annualPrice / 12);
    const costPerSlide = Math.round(effectiveMonthly / selectedSlides);

    // Use standardized base monthly impressions per slide
    const monthlyImpressionsPerSlide = 7600; // Base monthly impressions per slide (~253/day based on 7,600 daily screen views / 30 slides)
    const totalImpressions = monthlyImpressionsPerSlide * selectedSlides;
    const impressionsPerSlidePerDay = Math.round(monthlyImpressionsPerSlide / 30);

    const costPerImpression = (effectiveMonthly / totalImpressions).toFixed(3);
    const annualSavings = (monthlyPrice * 12) - annualPrice;

    // Calculate visibility metrics using dynamic settings
    const dailyImpressions = impressionsPerSlidePerDay * selectedSlides;
    const weeklyImpressions = dailyImpressions * 7;
    const monthlyImpressions = totalImpressions;
    const annualImpressions = totalImpressions * 12;

    // Calculate display time based on rotation cycles (not impressions)
    const totalRotationsPerDay = (dailyOperatingHours * 3600) / slideIntervalSeconds;
    const timesEachSlideShowsPerDay = totalRotationsPerDay / totalSlidesInRotation;
    const timesCustomerSlidesShowPerDay = timesEachSlideShowsPerDay * selectedSlides;

    const dailyMinutes = Math.round((timesCustomerSlidesShowPerDay * slideIntervalSeconds) / 60);
    const weeklyMinutes = dailyMinutes * 7;
    const weeklyHours = Math.round(weeklyMinutes / 60 * 10) / 10;
    const monthlyHours = Math.round((dailyMinutes * 30) / 60);
    const annualHours = Math.round((dailyMinutes * 365) / 60);

    return {
      planCost: billingPlan === "monthly" ? `$${monthlyPrice}/month` : `$${annualPrice}/year`,
      effectiveRate: effectiveMonthly,
      costPerSlide,
      costPerImpression,
      annualSavings,
      dailyImpressions,
      weeklyImpressions,
      monthlyImpressions,
      annualImpressions,
      dailyMinutes,
      weeklyHours,
      monthlyHours,
      annualHours,
    };
  };

  const metrics = calculateMetrics();

  return (
    <Card className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 lg:p-12">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Calculator Controls */}
        <div className="space-y-8">
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">Number of Slides</label>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((slides) => (
                <Button
                  key={slides}
                  variant={selectedSlides === slides ? "default" : "outline"}
                  onClick={() => setSelectedSlides(slides)}
                  className={`p-4 font-semibold transition-colors ${
                    selectedSlides === slides
                      ? "bg-[#3fb9ff] text-white border-[#3fb9ff]"
                      : "bg-white border-2 border-gray-200 text-gray-600 hover:border-[#3fb9ff]"
                  }`}
                >
                  {slides} Slide{slides > 1 ? 's' : ''}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">Billing Plan</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={billingPlan === "monthly" ? "default" : "outline"}
                onClick={() => setBillingPlan("monthly")}
                className={`p-4 font-semibold transition-colors ${
                  billingPlan === "monthly"
                    ? "bg-[#3fb9ff] text-white border-[#3fb9ff]"
                    : "bg-white border-2 border-gray-200 text-gray-600 hover:border-[#3fb9ff]"
                }`}
              >
                Monthly
              </Button>
              <Button
                variant={billingPlan === "annual" ? "default" : "outline"}
                onClick={() => setBillingPlan("annual")}
                className={`p-4 font-semibold transition-colors relative ${
                  billingPlan === "annual"
                    ? "bg-[#3fb9ff] text-white border-[#3fb9ff]"
                    : "bg-white border-2 border-gray-200 text-gray-600 hover:border-[#3fb9ff]"
                }`}
              >
                Annual
                <Badge className="absolute -top-2 -right-2 bg-[#3fb9ff] text-white text-xs">
                  Save 16.7%
                </Badge>
              </Button>
            </div>
          </div>

          <Card className="bg-white rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Investment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan Cost:</span>
                  <span className="font-semibold text-gray-900">{metrics.planCost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Effective Monthly Rate:</span>
                  <span className="font-semibold text-gray-900">${metrics.effectiveRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost per Slide:</span>
                  <span className="font-semibold text-gray-900">${metrics.costPerSlide}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost per Impression:</span>
                  <span className="font-semibold text-[#3fb9ff]">${metrics.costPerImpression}</span>
                </div>
                {billingPlan === "annual" && (
                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-[#3fb9ff]">
                      <span className="font-medium">Annual Savings:</span>
                      <span className="font-bold">${metrics.annualSavings}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Display */}
        <div className="space-y-6">
          <Card className="bg-white rounded-2xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Visibility Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#3fb9ff]">~{metrics.dailyImpressions.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Daily Impressions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#3fb9ff]">~{metrics.weeklyImpressions.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Weekly Impressions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#3fb9ff]">~{metrics.monthlyImpressions.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Monthly Impressions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#3fb9ff]">~{metrics.annualImpressions.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Annual Impressions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Display Time Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Screen Time:</span>
                  <span className="font-semibold text-gray-900">{metrics.dailyMinutes} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weekly Screen Time:</span>
                  <span className="font-semibold text-gray-900">{metrics.weeklyHours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Screen Time:</span>
                  <span className="font-semibold text-gray-900">{metrics.monthlyHours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Screen Time:</span>
                  <span className="font-semibold text-[#3fb9ff]">{metrics.annualHours} hours</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dovito-gradient rounded-2xl text-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Value Highlights</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-white">&#10003;</span>
                  <span>{slideIntervalSeconds}-second rotation cycle</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-white">&#10003;</span>
                  <span>{dailyOperatingHours}-hour daily coverage ({operatingStartTime}AM-10:00PM)</span>
                </div>


              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link href="/apply">
          <Button size="lg" className="bg-[#3fb9ff] hover:bg-[#0099cc] text-lg">
            <Rocket className="mr-2 h-5 w-5" />
            Start Your Application
          </Button>
        </Link>
      </div>
    </Card>
  );
}
