"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, Shield, Check, Tag, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/query-client";

interface PendingPaymentSetup {
  applicationData: { businessName?: string; contactName?: string; contactEmail?: string };
  imageCount: number;
  customerId?: string;
  setupIntentId?: string;
  files?: unknown[];
  clientSecret?: string;
}

interface CouponData {
  name: string;
  percent_off?: number;
  amount_off?: number;
}

export default function CollectPayment() {
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSetup, setPaymentSetup] = useState<PendingPaymentSetup | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState<CouponData | null>(null);
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("pendingPaymentSetup") : null;
    if (!stored) {
      // Seed a demo setup for standalone viewing
      const demo: PendingPaymentSetup = {
        applicationData: {
          businessName: "Demo Business",
          contactName: "Demo Contact",
          contactEmail: "demo@example.com",
        },
        imageCount: 1,
      };
      setPaymentSetup(demo);
      return;
    }
    setPaymentSetup(JSON.parse(stored));
  }, []);

  const validateCoupon = async (code: string) => {
    if (!code.trim()) {
      setCouponData(null);
      setCouponError("");
      return;
    }
    setCouponValidating(true);
    setCouponError("");
    try {
      const res = await apiRequest("POST", "/api/validate-coupon", { code: code.trim() });
      const data = await res.json();
      if (data.valid) {
        const coupon: CouponData = { name: data.code || "Demo Coupon", amount_off: data.discount };
        setCouponData(coupon);
        toast({ title: "Coupon Applied", description: `${coupon.name} discount applied!` });
      } else {
        setCouponData(null);
        setCouponError("Invalid coupon code (try LAUNCH20)");
      }
    } catch {
      setCouponData(null);
      setCouponError("Failed to validate coupon");
    }
    setCouponValidating(false);
  };

  const handleCouponInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCouponCode(value);
    setTimeout(() => validateCoupon(value), 500);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!paymentSetup) return;
    setIsProcessing(true);
    try {
      await apiRequest("POST", "/api/applications/submit-with-payment", {
        applicationData: paymentSetup.applicationData,
        imageCount: paymentSetup.imageCount,
      });
      if (typeof window !== "undefined") localStorage.removeItem("pendingPaymentSetup");
      toast({
        title: "Application Submitted (Demo)",
        description: "No real payment was captured.",
      });
      router.push("/apply/success");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!paymentSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const getPriceText = (imageCount: number) => {
    const prices: Record<number, string> = { 1: "$200", 2: "$350", 3: "$500" };
    return prices[imageCount] || "$200";
  };
  const calculateFinalPrice = (imageCount: number) => {
    const basePrices: Record<number, number> = { 1: 200, 2: 350, 3: 500 };
    const basePrice = basePrices[imageCount] || 200;
    if (!couponData) return basePrice;
    let discount = 0;
    if (couponData.percent_off) discount = basePrice * (couponData.percent_off / 100);
    else if (couponData.amount_off) discount = couponData.amount_off / 100;
    return Math.max(0, basePrice - discount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Secure Payment Setup (Demo)
            </CardTitle>
            <CardDescription>
              This is a static demo. No payment is captured. Enter any fake details to proceed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Check className="w-4 h-4" />
              <AlertDescription>
                <strong>Demo mode:</strong> The form below is non-functional and stores nothing.
                Submitting will navigate to the success page.
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Application Summary</h3>
              <div className="text-sm space-y-1">
                <p><strong>Business:</strong> {paymentSetup.applicationData.businessName}</p>
                <p><strong>Images:</strong> {paymentSetup.imageCount}</p>
                {couponData ? (
                  <>
                    <p className="line-through text-gray-500">
                      <strong>Original Price:</strong> {getPriceText(paymentSetup.imageCount)}/month
                    </p>
                    <p className="text-green-600 flex items-center">
                      <Percent className="w-4 h-4 mr-1" />
                      <strong>Discount ({couponData.name}):</strong>
                      {couponData.percent_off
                        ? ` ${couponData.percent_off}% off`
                        : ` $${((couponData.amount_off || 0) / 100).toFixed(2)} off`}
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      <strong>Final Price:</strong> ${calculateFinalPrice(paymentSetup.imageCount)}/month
                    </p>
                  </>
                ) : (
                  <p><strong>Monthly Cost:</strong> {getPriceText(paymentSetup.imageCount)}</p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="coupon" className="flex items-center text-sm font-medium mb-2">
                  <Tag className="w-4 h-4 mr-2" />
                  Coupon Code (Optional — try LAUNCH20)
                </Label>
                <Input
                  id="coupon"
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={handleCouponInputChange}
                  className={couponError ? "border-red-500" : couponData ? "border-green-500" : ""}
                />
                {couponValidating && (
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Validating coupon...
                  </div>
                )}
                {couponError && <p className="text-sm text-red-600 mt-1">{couponError}</p>}
              </div>

              <div>
                <Label className="flex items-center text-sm font-medium mb-2">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payment Method (Demo — any values accepted)
                </Label>
                <div className="border rounded-lg p-4 bg-white space-y-3">
                  <div>
                    <Label htmlFor="cardNumber" className="text-xs text-gray-500">Card number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="expiry" className="text-xs text-gray-500">Expiry</Label>
                      <Input
                        id="expiry"
                        placeholder="MM / YY"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-xs text-gray-500">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isProcessing} size="lg">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting (demo)...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Submit Application (Demo)
                  </>
                )}
              </Button>
            </form>

            <div className="text-xs text-gray-500 text-center">
              <p>This is a demo. No real payment is processed.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
