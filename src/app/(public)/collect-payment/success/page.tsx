"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/navigation';
import Link from 'next/link';

export default function CollectPaymentSuccess() {
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<'pending' | 'uploading' | 'success' | 'error'>('pending');
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Guard: only run once even in React Strict Mode (double-invoke) or if deps change
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) {
      toast({
        title: "Error",
        description: "No checkout session found. Please try again.",
        variant: "destructive",
      });
      router.push('/apply');
      return;
    }

    // Get stored application data
    const storedApplicationData = sessionStorage.getItem('applicationData');
    const storedApplicationId = sessionStorage.getItem('applicationId');
    const storedImageCount = sessionStorage.getItem('imageCount');
    const storedBillingPeriod = sessionStorage.getItem('billingPeriod');
    const storedImages = sessionStorage.getItem('uploadedImages');

    if (!storedApplicationData || !storedImageCount || !storedApplicationId) {
      toast({
        title: "Error",
        description: "Application data not found. Please restart the application process.",
        variant: "destructive",
      });
      router.push('/apply');
      return;
    }

    const appData = JSON.parse(storedApplicationData);
    setApplicationData({
      ...appData,
      imageCount: parseInt(storedImageCount),
      billingPeriod: storedBillingPeriod || 'monthly',
      imageFiles: storedImages ? JSON.parse(storedImages) : []
    });

    // Process the checkout session
    processCheckoutSession(sessionId, appData, parseInt(storedImageCount), parseInt(storedApplicationId));
  }, []);

  const processCheckoutSession = async (sessionId: string, appData: any, imageCount: number, applicationId: number) => {
    try {
      console.log('[CHECKOUT SUCCESS] Processing checkout session...', { sessionId, imageCount, applicationId });

      // Get uploaded image URLs from sessionStorage
      const storedImageUrls = sessionStorage.getItem('uploadedImageUrls');
      const uploadedImageUrls = storedImageUrls ? JSON.parse(storedImageUrls) : [];

      console.log('[CHECKOUT SUCCESS] Using uploaded image URLs:', uploadedImageUrls);

      // Retrieve and process the Stripe session
      const response = await fetch('/api/process-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          applicationData: appData,
          applicationId, // Pass the application ID to update existing record
          imageCount,
          uploadedImageUrls, // Pass the pre-uploaded image URLs
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process checkout session');
      }

      const data = await response.json();
      setSessionData(data);

      // Mark upload as success since images were already uploaded before checkout
      if (uploadedImageUrls.length > 0) {
        setUploadStatus('success');
      }

      setIsProcessing(false);

      // Clean up sessionStorage
      sessionStorage.removeItem('applicationData');
      sessionStorage.removeItem('imageCount');
      sessionStorage.removeItem('billingPeriod');
      sessionStorage.removeItem('uploadedImageUrls');

      toast({
        title: "Application Submitted Successfully",
        description: `Your application with ${uploadedImageUrls.length} image(s) has been submitted. You'll only be charged after approval.`,
      });

    } catch (error) {
      console.error('Checkout processing error:', error);
      setIsProcessing(false);
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to process checkout",
        variant: "destructive",
      });
    }
  };



  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-20 pb-12">
          <div className="max-w-2xl mx-auto px-4">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Processing Your Checkout</h2>
                <p className="text-gray-600 text-center">
                  Please wait while we process your payment information and submit your application...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Checkout Complete
              </CardTitle>
              <CardDescription>
                Your application has been submitted successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              <Alert>
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Authorization hold placed:</strong> We've placed a temporary hold on your payment method.
                  The charge will be finalized only upon application approval by our team.
                </AlertDescription>
              </Alert>

              {applicationData && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Application Summary</h3>
                  <div className="text-sm space-y-1">
                    <p><strong>Business:</strong> {applicationData.businessName}</p>
                    <p><strong>Contact:</strong> {applicationData.contactName}</p>
                    <p><strong>Email:</strong> {applicationData.contactEmail}</p>
                    <p><strong>Images:</strong> {applicationData.imageCount}</p>
                    {sessionData?.discount && (
                      <p className="text-green-600">
                        <strong>Discount Applied:</strong> {sessionData.discount.name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Next Steps</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Our team will review your application and images. You'll receive an email
                      notification once your application is approved or if we need any additional information.
                    </p>
                  </div>
                </div>
              </div>

              <Link href="/track">
                <Button className="w-full" size="lg">
                  Track Status
                </Button>
              </Link>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
