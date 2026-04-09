"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import MarketingCalculator from "@/components/marketing-calculator";
import EmbeddedDisplay from "@/components/embedded-display";
import { Play, Rocket, FileText, UserCheck, Tv, Eye, Clock, Users, CheckCircle, ArrowRight, ExternalLink, Phone } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { SiFacebook, SiInstagram, SiLinkedin, SiX } from "react-icons/si";
import type { DisplaySetting } from "@/lib/schema";

export default function Landing() {
  const [billingPlan, setBillingPlan] = useState<"monthly" | "annual">("monthly");

  // Fetch display settings
  const { data: displaySettings = [] } = useQuery<DisplaySetting[]>({
    queryKey: ["/api/display-settings"],
    retry: false,
  });

  const getDisplaySettingValue = (key: string, defaultValue: any) => {
    const setting = displaySettings.find(s => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
  };

  const pricingPlans = [
    {
      name: "Starter",
      slides: 1,
      monthly: 160,
      annual: 1600,
      impressions: 7600,
      popular: true,
      features: [
        "1 advertising slide",
        "7,600 monthly impressions"
      ]
    },
    {
      name: "Growth",
      slides: 2,
      monthly: 300,
      annual: 3000,
      impressions: 15200,
      features: [
        "2 advertising slides",
        "15,200 monthly impressions"
      ]
    },
    {
      name: "Premium",
      slides: 3,
      monthly: 420,
      annual: 4200,
      impressions: 22800,
      features: [
        "3 advertising slides (max)",
        "22,800 monthly impressions"
      ]
    }
  ];

  const getEffectivePrice = (plan: typeof pricingPlans[0]) => {
    return billingPlan === "monthly"
      ? plan.monthly
      : Math.round(plan.annual / 12);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {/* Hero Section */}
      <section className="relative dovito-gradient text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-r from-black/50 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Get Your Business Seen on<br />
              <span className="text-white">Main Street Windsor</span>
            </h1>
            <p className="text-xl text-white/80 mb-8 leading-relaxed max-w-4xl mx-auto">
              Advertise your local business on our premium digital display in the heart of Windsor's Main Street.
              Reach thousands of potential customers with professional, rotating advertisements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
              <Link href="/apply">
                <Button size="lg" className="bg-white text-[#1a365d] hover:bg-gray-100 text-lg">
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Application
                </Button>
              </Link>
              <Link href="/display">
                <Button
                  size="lg"
                  className="bg-white text-[#1a365d] hover:bg-gray-100 text-lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  See Live Display
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center space-x-6 text-white/80 mb-12">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-white" />
                <span>7,600+ monthly views</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-white" />
                <span>16 hours daily</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-white" />
                <span>Local foot traffic</span>
              </div>
            </div>

            <div className={`mx-auto ${
              getDisplaySettingValue('maxWidth', '4xl') === '3xl' ? 'max-w-3xl' :
              getDisplaySettingValue('maxWidth', '4xl') === '4xl' ? 'max-w-4xl' :
              getDisplaySettingValue('maxWidth', '4xl') === '5xl' ? 'max-w-5xl' :
              'max-w-6xl'
            }`}>
              <Card className={`bg-black shadow-2xl ${
                getDisplaySettingValue('borderRadius', 'lg') === 'none' ? 'rounded-none' :
                getDisplaySettingValue('borderRadius', 'lg') === 'sm' ? 'rounded-sm' :
                getDisplaySettingValue('borderRadius', 'lg') === 'md' ? 'rounded-md' :
                getDisplaySettingValue('borderRadius', 'lg') === 'lg' ? 'rounded-lg' :
                'rounded-xl'
              } ${
                getDisplaySettingValue('padding', 2) === 1 ? 'p-1' :
                getDisplaySettingValue('padding', 2) === 2 ? 'p-2' :
                getDisplaySettingValue('padding', 2) === 3 ? 'p-3' :
                getDisplaySettingValue('padding', 2) === 4 ? 'p-4' :
                'p-5'
              }`}>
                <div className="w-full" style={{ aspectRatio: "16/9" }}>
                  <div className="w-full h-full rounded overflow-hidden relative">
                    <div
                      className="w-full h-full origin-center transform"
                      style={{ transform: `scale(${getDisplaySettingValue('scale', 0.8)})` }}
                    >
                      <EmbeddedDisplay />
                    </div>
                  </div>
                </div>
                <div className={`text-center text-gray-400 flex items-center justify-center space-x-2 ${
                  getDisplaySettingValue('captionSpacing', 2) === 1 ? 'mt-1' :
                  getDisplaySettingValue('captionSpacing', 2) === 2 ? 'mt-2' :
                  getDisplaySettingValue('captionSpacing', 2) === 3 ? 'mt-3' :
                  getDisplaySettingValue('captionSpacing', 2) === 4 ? 'mt-4' :
                  'mt-5'
                } ${
                  getDisplaySettingValue('captionSize', 'sm') === 'xs' ? 'text-xs' :
                  getDisplaySettingValue('captionSize', 'sm') === 'sm' ? 'text-sm' :
                  getDisplaySettingValue('captionSize', 'sm') === 'base' ? 'text-base' :
                  'text-lg'
                }`}>
                  <Tv className="h-4 w-4" />
                  <span>Live on Main Street • Updated every 15 seconds</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get your business advertising on Main Street in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <Card className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 text-center">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-[#3fb9ff] rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Apply</h3>
                  <p className="text-gray-600 mb-6">Upload your 16:9 image and business details. Our application process takes less than 10 minutes.</p>
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <CheckCircle className="h-4 w-4 text-[#3fb9ff]" />
                        <span>Business details</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <CheckCircle className="h-4 w-4 text-[#3fb9ff]" />
                        <span>16:9 Ad Image</span>
                      </div>

                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <ArrowRight className="h-8 w-8 text-[#CCCCCC]" />
              </div>
            </div>

            <div className="relative">
              <Card className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 text-center">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-[#3fb9ff] rounded-full flex items-center justify-center mx-auto mb-6">
                    <UserCheck className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Get Approved</h3>
                  <p className="text-gray-600 mb-6">Our team reviews your application within 24 hours. If there is availability, we will approve quality, local content, publishing your ad right away.</p>
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4 text-[#3fb9ff]" />
                        <span>24-hour review</span>
                      </div>

                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <ArrowRight className="h-8 w-8 text-[#CCCCCC]" />
              </div>
            </div>

            <div className="relative">
              <Card className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 text-center">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-[#3fb9ff] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Rocket className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Go Live</h3>
                  <p className="text-gray-600 mb-6">Once approved, your card is then charged, and the ad goes live on our Main Street display. Your business will start reaching thousands of potential customers.</p>
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Tv className="h-4 w-4 text-[#3fb9ff]" />
                        <span>Live on Main Street</span>
                      </div>


                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that works for your business. All plans include professional design and analytics.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <Card className="p-1">
              <div className="flex items-center">
                <Button
                  variant={billingPlan === "monthly" ? "default" : "ghost"}
                  onClick={() => setBillingPlan("monthly")}
                  className="px-6 py-2 rounded-md font-medium"
                >
                  Monthly
                </Button>
                <Button
                  variant={billingPlan === "annual" ? "default" : "ghost"}
                  onClick={() => setBillingPlan("annual")}
                  className="px-6 py-2 rounded-md font-medium relative"
                >
                  Annual
                  <Badge className="absolute -top-2 -right-2 bg-[#3fb9ff] text-white text-xs">
                    Save 16.7%
                  </Badge>
                </Button>
              </div>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={plan.name}
                className={`relative ${plan.popular ? 'border-2 border-[#3fb9ff] transform scale-105' : 'border-2 border-gray-100'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-[#3fb9ff] text-white px-4 py-2">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="text-5xl font-bold text-[#3fb9ff] mb-2">
                      ${getEffectivePrice(plan)}
                    </div>
                    <div className="text-gray-500">per month</div>
                    {billingPlan === "annual" && (
                      <div className="text-sm text-[#3fb9ff] font-medium mt-1">
                        ${plan.annual.toLocaleString()} billed annually
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-[#3fb9ff] flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/apply">
                    <Button className="w-full bg-[#3fb9ff] hover:bg-[#0099cc]">
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Marketing Calculator Section */}
      <section id="calculator" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Calculate Your ROI</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See exactly how much visibility your business will get and calculate your return on investment
            </p>
          </div>
          <MarketingCalculator />
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Common Questions</h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="how-it-works">
              <AccordionTrigger>How does the ad display work?</AccordionTrigger>
              <AccordionContent>
                Your ad image rotates on our high-visibility digital display at 508 Main Street in Windsor, CO.
                Each ad shows for 15 seconds alongside other local businesses, running 16 hours a day, 7 days a week.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="image-specs">
              <AccordionTrigger>What image specs do I need?</AccordionTrigger>
              <AccordionContent>
                Ads must be a 16:9 aspect ratio image (1920×1080px recommended) in PNG, JPEG, or WebP format, up to 10MB.
                Your image should be clear, high-contrast, and legible from a distance. We review every submission before it goes live.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="approval-time">
              <AccordionTrigger>How long does approval take?</AccordionTrigger>
              <AccordionContent>
                Our team reviews new applications within 1–2 business days. You will receive an email notification once your
                ad is approved and live, or if we need any changes to your submitted image.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="change-ad">
              <AccordionTrigger>Can I change my ad after it is live?</AccordionTrigger>
              <AccordionContent>
                Yes. Log in to your dashboard at any time to upload a new ad image. Updated images go through the same
                1–2 business day review process before going live on the display.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="cancellation">
              <AccordionTrigger>What is the cancellation policy?</AccordionTrigger>
              <AccordionContent>
                Monthly plans can be cancelled at any time and your ad will remain live until the end of the current billing period.
                Annual plans are billed upfront and are non-refundable, but you may cancel to prevent renewal at the end of the year.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="analytics">
              <AccordionTrigger>Do I get analytics on my ad?</AccordionTrigger>
              <AccordionContent>
                Yes. Your dashboard shows impression counts — how many times your ad was displayed — updated in real time.
                You can track daily, weekly, and monthly totals to measure your reach over time.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="qr-code">
              <AccordionTrigger>What is the QR code feature?</AccordionTrigger>
              <AccordionContent>
                Each ad can include a QR code that links to a URL of your choice — your website, a menu, a promotion, or any landing page.
                Customers who scan it are taken directly to your destination, making it easy to turn impressions into action.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="pricing">
              <AccordionTrigger>What are the pricing plans?</AccordionTrigger>
              <AccordionContent>
                We offer three plans: Starter (1 slide, $160/mo), Growth (2 slides, $300/mo), and Premium (3 slides, $420/mo).
                Annual billing saves 16.7% compared to monthly. All plans include analytics, QR code support, and the same high-visibility placement.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
      {/* Social Proof Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Local Businesses Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "We saw a noticeable uptick in walk-ins within the first month. Having our name on Main Street has made a real difference.",
                name: "Local Business Owner",
                business: "Windsor, CO",
              },
              {
                quote: "The self-serve dashboard makes it easy to update our ad whenever we run a new promotion. No waiting, no phone calls.",
                name: "Marketing Manager",
                business: "Windsor, CO",
              },
              {
                quote: "Great value compared to other local advertising options. The analytics are a nice bonus — I can see exactly how many impressions we are getting.",
                name: "Small Business Owner",
                business: "Windsor, CO",
              },
            ].map((testimonial, i) => (
              <Card key={i} className="p-6">
                <p className="text-gray-600 mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.business}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 dovito-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Get Your Business Seen?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Put your business in front of thousands of potential customers on Main Street Windsor.
            Apply today and start building your local presence.
          </p>
          <div className="flex justify-center">
            <Link href="/apply">
              <Button size="lg" className="bg-white text-[#1a365d] hover:bg-gray-100 text-lg">
                <Rocket className="mr-2 h-5 w-5" />
                Start Your Application
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 dovito-gradient rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">D</span>
                </div>
                <span className="text-xl font-bold text-white">Ads by Dovito</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Helping local Windsor businesses reach more customers through strategic
                Main Street advertising placement.
              </p>

              <div className="flex items-center gap-3">
                <Link href="/register">
                  <Button className="bg-gray-800 text-gray-300 hover:bg-gray-700 border-0">
                    Sign Up
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button className="bg-gray-800 text-gray-300 hover:bg-gray-700 border-0">
                    Admin Login
                  </Button>
                </Link>
              </div>
            </div>


          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 mb-2">2025 Ads by Dovito. All rights reserved. | 508 Main Street, Windsor, CO 80550</p>
            <div className="flex items-center justify-center gap-4 mt-2">
              <Link href="/track">
                <span className="text-gray-500 hover:text-gray-300 text-sm cursor-pointer">Track Status</span>
              </Link>
              <span className="text-gray-700">·</span>
              <Link href="/brand-kit">
                <span className="text-gray-500 hover:text-gray-300 text-sm cursor-pointer">Brand Kit</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
