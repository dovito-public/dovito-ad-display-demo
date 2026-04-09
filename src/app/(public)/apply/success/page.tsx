"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { CheckCircle, ArrowLeft, Upload, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ApplySuccess() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [imageCount, setImageCount] = useState<number>(1);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [step, setStep] = useState<"upload" | "submitting" | "completed">("upload");

  const { toast } = useToast();

  useEffect(() => {
    // Extract session ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdParam = urlParams.get('session_id');

    if (sessionIdParam) {
      setSessionId(sessionIdParam);

      // Retrieve stored application data from sessionStorage
      const storedData = sessionStorage.getItem('applicationData');
      const storedImageCount = sessionStorage.getItem('imageCount');

      if (storedData && storedImageCount) {
        setApplicationData(JSON.parse(storedData));
        setImageCount(parseInt(storedImageCount));
      }
    } else {
      // No session ID, redirect back to apply
      router.push('/apply');
    }
  }, [router]);

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const currentFiles = [...uploadedImages];

    // Add new files up to the selected count
    for (const file of newFiles) {
      if (currentFiles.length < imageCount) {
        currentFiles.push(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      }
    }

    setUploadedImages(currentFiles);
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const submitApplicationMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId || !applicationData) throw new Error("Missing required data");

      const formData = new FormData();

      // Add session data
      formData.append('sessionId', sessionId);
      formData.append('applicationData', JSON.stringify(applicationData));
      formData.append('imageCount', imageCount.toString());

      // Add images
      uploadedImages.forEach((file, index) => {
        formData.append('images', file);
      });

      const response = await fetch('/api/applications/after-checkout', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }

      return response.json();
    },
    onSuccess: () => {
      setStep("completed");
      // Clear stored data
      sessionStorage.removeItem('applicationData');
      sessionStorage.removeItem('imageCount');
      toast({
        title: "Application Submitted",
        description: "Your application is now under review. You will not be charged until approved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    if (uploadedImages.length !== imageCount) {
      toast({
        title: "Upload Required",
        description: `Please upload exactly ${imageCount} image(s) before submitting.`,
        variant: "destructive",
      });
      return;
    }

    setStep("submitting");
    submitApplicationMutation.mutate();
  };

  if (step === "completed") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto pt-24 pb-16 px-4">
          <Card>
            <CardContent className="pt-8 text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h1>
              <p className="text-gray-600 mb-4">
                Thank you for your application. Here's what happens next:
              </p>
              <div className="text-left space-y-3 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full p-1 mt-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <p className="text-sm">Our team will review your application and images within 24 hours</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full p-1 mt-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <p className="text-sm">If approved, the authorization hold will be finalized and ads will go live</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full p-1 mt-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <p className="text-sm">If rejected, the authorization hold will be released</p>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  <strong>Payment Status:</strong> Authorization hold placed - payment will be finalized upon application approval
                </p>
              </div>
              <Link href="/">
                <Button>Return to Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!sessionId || !applicationData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto pt-24 pb-16 px-4">
          <Card>
            <CardContent className="pt-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
              <p className="text-gray-600 mb-4">Processing your checkout session...</p>
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto pt-24 pb-16 px-4">

        <div className="text-center mb-8">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-lg text-gray-600">
            Now upload your {imageCount} advertising image(s) to complete your application
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Upload Your Images ({uploadedImages.length}/{imageCount})</span>
              {uploadedImages.length === imageCount && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>

            {/* Payment Summary */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="font-medium text-green-900">Checkout Complete</p>
                  <p className="text-sm text-green-700">
                    Business: {applicationData.businessName} | Package: {imageCount} image(s)
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload your advertising images
              </h3>
              <p className="text-gray-500 mb-4">
                PNG or JPG files up to 10MB each. Recommended size: 1920x1080px (16:9 ratio)
              </p>
              <input
                type="file"
                multiple
                onChange={(e) => handleImageUpload(e.target.files)}
                accept="image/*"
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                Choose Files
              </label>
            </div>

            {/* Image Previews */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative border rounded-lg p-2">
                    <img
                      src={preview}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1"
                      onClick={() => removeImage(index)}
                    >
                      x
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Important Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Important: Authorization Hold Process</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      An authorization hold has been placed on your payment method for verification.
                      If rejected, the hold will be released. Upload exactly {imageCount} image(s) to complete your submission.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <Link href="/apply">
                <Button variant="outline" disabled={step === "submitting"}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Application
                </Button>
              </Link>

              <Button
                onClick={handleSubmit}
                disabled={uploadedImages.length !== imageCount || step === "submitting"}
                className="flex-1"
              >
                {step === "submitting" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  "Submit Application for Review"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
