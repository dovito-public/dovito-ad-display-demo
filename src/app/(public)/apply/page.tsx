"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { Rocket, Upload, CheckCircle, ArrowLeft, Image, CreditCard, AlertCircle, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// Stripe removed for static demo

// Application schema for the new flow
const applicationSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().min(10, "Valid phone number is required"),
  qrUrl: z.string().url().optional().or(z.literal("")),
  imageCount: z.enum(["1", "2", "3"], { message: "Please select number of images" }),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function Apply() {
  const [step, setStep] = useState<"form" | "upload" | "checkout" | "submitted">("form");
  const [submitted, setSubmitted] = useState(false);
  const [applicationData, setApplicationData] = useState<ApplicationFormData | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedImageCount, setSelectedImageCount] = useState<number>(1);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  // Database-first approach state management
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [isCreatingApplication, setIsCreatingApplication] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [imagesSavedToDatabase, setImagesSavedToDatabase] = useState(false);
  const [databaseImageUrls, setDatabaseImageUrls] = useState<string[]>([]);

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      businessName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      qrUrl: "",
      imageCount: "1",
    },
  });

  // Pricing based on image count and billing period
  const getPricing = (imageCount: number, billing: 'monthly' | 'annual' = billingPeriod) => {
    if (billing === 'annual') {
      switch (imageCount) {
        case 1: return { amount: 1600, name: "Starter", description: "1 advertising slide", monthly: 160, savings: 320 };
        case 2: return { amount: 3000, name: "Growth", description: "2 advertising slides", monthly: 300, savings: 600 };
        case 3: return { amount: 4200, name: "Premium", description: "3 advertising slides", monthly: 420, savings: 840 };
        default: return { amount: 1600, name: "Starter", description: "1 advertising slide", monthly: 160, savings: 320 };
      }
    } else {
      switch (imageCount) {
        case 1: return { amount: 160, name: "Starter", description: "1 advertising slide" };
        case 2: return { amount: 300, name: "Growth", description: "2 advertising slides" };
        case 3: return { amount: 420, name: "Premium", description: "3 advertising slides" };
        default: return { amount: 160, name: "Starter", description: "1 advertising slide" };
      }
    }
  };

  // Step 1: Create application record in database (Application Details)
  const handleFormSubmit = async (data: ApplicationFormData) => {
    setIsCreatingApplication(true);

    try {
      console.log('[STEP 1] Creating draft application...', data);

      const response = await fetch('/api/applications/create-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: data.businessName,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          imageCount: parseInt(data.imageCount),
          billingPeriod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create application');
      }

      const result = await response.json();

      console.log('[STEP 1] Application created successfully:', result);

      // Save application data and ID for Step 2
      setApplicationData(data);
      setSelectedImageCount(parseInt(data.imageCount));
      setApplicationId(result.applicationId);

      toast({
        title: "Application Started",
        description: `Draft application created for ${data.businessName}. Please upload your images.`,
      });

      setStep("upload");
    } catch (error) {
      console.error('[STEP 1] Error creating application:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingApplication(false);
    }
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const currentFiles = [...uploadedImages];
    const currentPreviews = [...imagePreviews];

    // Validate each file before adding
    for (const file of newFiles) {
      if (currentFiles.length >= selectedImageCount) {
        toast({
          title: "Upload Limit Reached",
          description: `You can only upload ${selectedImageCount} image(s). Remove existing images to add new ones.`,
          variant: "destructive",
        });
        break;
      }

      // File size validation (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} is larger than 10MB. Please choose a smaller image.`,
          variant: "destructive",
        });
        continue;
      }

      // File type validation
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not an image. Please upload PNG, JPG, or JPEG files only.`,
          variant: "destructive",
        });
        continue;
      }

      currentFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        currentPreviews.push(e.target?.result as string);
        setImagePreviews([...currentPreviews]);
      };
      reader.readAsDataURL(file);
    }

    setUploadedImages(currentFiles);

    // Show success feedback
    if (currentFiles.length > uploadedImages.length) {
      const newUploads = currentFiles.length - uploadedImages.length;
      toast({
        title: "Images Added",
        description: `Successfully added ${newUploads} image(s). ${selectedImageCount - currentFiles.length} more needed.`,
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Step 2: Save images to database immediately (Upload Images)
  const proceedToCheckout = async () => {
    if (uploadedImages.length !== selectedImageCount) {
      toast({
        title: "Upload Required",
        description: `Please upload exactly ${selectedImageCount} image(s) before proceeding.`,
        variant: "destructive",
      });
      return;
    }

    if (!applicationId) {
      toast({
        title: "Error",
        description: "Application ID not found. Please restart the process.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImages(true);
    setImagesSavedToDatabase(false);

    try {
      console.log('[STEP 2] Uploading images to database...', { applicationId, imageCount: uploadedImages.length });

      // Show progress feedback
      toast({
        title: "Processing Upload",
        description: `Saving ${uploadedImages.length} image(s) to database...`,
      });

      // Create FormData for image upload
      const formData = new FormData();
      formData.append('applicationId', applicationId.toString());
      formData.append('businessName', applicationData?.businessName || '');

      uploadedImages.forEach((file, index) => {
        formData.append('images', file);
        console.log(`[STEP 2] Adding image ${index + 1}: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
      });

      const response = await fetch('/api/applications/upload-images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload images to database');
      }

      const result = await response.json();

      console.log('[STEP 2] Images saved to database successfully:', result);

      // Mark images as saved to database
      setImagesSavedToDatabase(true);
      setDatabaseImageUrls(result.imageUrls);

      toast({
        title: "Upload Complete!",
        description: `${result.imageCount} image(s) saved successfully. Proceeding to checkout...`,
      });

      // Small delay to show success message, then proceed to checkout
      setTimeout(() => {
        setStep("checkout");
      }, 1000);

    } catch (error) {
      console.error('[STEP 2] Error uploading images to database:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to save images to database. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (!applicationData) return;
    try {
      sessionStorage.setItem("applicationData", JSON.stringify(applicationData));
      sessionStorage.setItem("applicationId", applicationId?.toString() || "");
      sessionStorage.setItem("imageCount", selectedImageCount.toString());
      sessionStorage.setItem("billingPeriod", billingPeriod);
      sessionStorage.setItem("uploadedImageUrls", JSON.stringify(databaseImageUrls));
      toast({
        title: "Demo Checkout",
        description: "Skipping real payment — continuing to success page.",
      });
      router.push("/apply/success");
    } catch (error) {
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Failed to start checkout.",
        variant: "destructive",
      });
    }
  };

  const getPriceId = (imageCount: number, billing: 'monthly' | 'annual' = billingPeriod) => {
    if (billing === 'annual') {
      switch (imageCount) {
        case 1: return "price_1RnjMUIV9P552TYjc6HzkNG1"; // $1600/yr - Starter
        case 2: return "price_1Rfr2uIV9P552TYjlElRuMTY"; // $3000/yr - Growth
        case 3: return "price_1Rfr2uIV9P552TYjvAUBiMrn"; // $4200/yr - Premium
        default: return "price_1RnjMUIV9P552TYjc6HzkNG1";
      }
    } else {
      switch (imageCount) {
        case 1: return "price_1RnjL5IV9P552TYjmjQGtFdu"; // $160/mo - Starter
        case 2: return "price_1Rfr2uIV9P552TYjXVTFYI5B"; // $300/mo - Growth
        case 3: return "price_1Rfr2uIV9P552TYj2yuRe9jd"; // $420/mo - Premium
        default: return "price_1RnjL5IV9P552TYjmjQGtFdu";
      }
    }
  };

  const submitApplicationMutation = useMutation({
    mutationFn: async () => {
      if (!applicationData) throw new Error("No application data");

      const formData = new FormData();

      // Add application data
      Object.entries(applicationData).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      // Add images
      uploadedImages.forEach((file, index) => {
        formData.append(`image_${index}`, file);
      });

      // Add metadata
      formData.append('imageCount', selectedImageCount.toString());
      formData.append('paymentStatus', 'pending_approval');

      const response = await fetch('/api/applications', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to submit application');
      return response.json();
    },
    onSuccess: () => {
      setStep("submitted");
      toast({
        title: "Application Submitted",
        description: "Your application is now under review. You will not be charged until approved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  });

  if (step === "submitted") {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto pt-24 pb-16 px-4">

        {step === "form" && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Submit Your Advertisement</h1>
              <p className="text-lg text-gray-600">
                Choose your package, upload your images, and complete checkout before submission
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Step 1: Application Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Business Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="qrUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://yourbusiness.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Package Selection */}
                    <FormField
                      control={form.control}
                      name="imageCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Select Your Package *</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
                              {[
                                { count: 1, name: "Starter", price: 160, features: ["1 advertising slide", "16:9 display format", "QR code overlay"], popular: false },
                                { count: 2, name: "Growth",  price: 300, features: ["2 advertising slides", "16:9 display format", "QR code overlay"], popular: true  },
                                { count: 3, name: "Premium", price: 420, features: ["3 advertising slides", "16:9 display format", "QR code overlay"], popular: false },
                              ].map(({ count, name, price, features, popular }) => {
                                const isSelected = field.value === count.toString();
                                return (
                                  <button
                                    key={count}
                                    type="button"
                                    onClick={() => field.onChange(count.toString())}
                                    className={`relative flex flex-col p-5 rounded-xl border-2 text-left transition-all duration-200 focus:outline-none ${
                                      isSelected
                                        ? "border-blue-600 bg-blue-50 shadow-md"
                                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                                    }`}
                                  >
                                    {popular && (
                                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                                        Most Popular
                                      </span>
                                    )}
                                    <div className="flex items-center justify-between mb-3">
                                      <span className={`font-bold text-lg ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
                                        {name}
                                      </span>
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                        isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300"
                                      }`}>
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                      </div>
                                    </div>
                                    <div className="mb-4">
                                      <span className={`text-3xl font-extrabold ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
                                        ${price}
                                      </span>
                                      <span className="text-gray-500 text-sm">/month</span>
                                    </div>
                                    <ul className="space-y-2">
                                      {features.map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                                          <CheckCircle className={`h-4 w-4 flex-shrink-0 ${isSelected ? "text-blue-500" : "text-gray-400"}`} />
                                          {f}
                                        </li>
                                      ))}
                                    </ul>
                                  </button>
                                );
                              })}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isCreatingApplication}
                    >
                      {isCreatingApplication ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Creating Application...
                        </>
                      ) : (
                        <>
                          Continue to Image Upload
                          <Rocket className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </>
        )}

        {step === "upload" && applicationData && (
          <>
            <div className="flex items-center mb-6">
              <Button variant="ghost" onClick={() => setStep("form")} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Step 2: Upload Your Images</h1>
                <p className="text-gray-600">Upload exactly {selectedImageCount} advertising image(s)</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Upload Images ({uploadedImages.length}/{selectedImageCount})</span>
                  {uploadedImages.length === selectedImageCount && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>

                {/* Ad Design Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Ad Design Tips</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>Use a 16:9 aspect ratio (1920x1080 or higher resolution)</li>
                    <li>Keep text to a minimum — your image is viewed from 10–20 feet away</li>
                    <li>Use high-contrast colors so your ad stands out on the display</li>
                    <li>Avoid busy backgrounds. Simple, bold visuals work best.</li>
                    <li>Include your logo and business name prominently</li>
                    <li>Accepted formats: PNG, JPEG (max 10MB)</li>
                  </ul>
                </div>

                {/* Upload Area */}
                <div className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
                  uploadedImages.length === selectedImageCount
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}>
                  {uploadedImages.length === selectedImageCount ? (
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  ) : (
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  )}
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {uploadedImages.length === selectedImageCount
                      ? 'All images uploaded successfully!'
                      : 'Upload your advertising images'
                    }
                  </h3>
                  <p className="text-gray-500 mb-4">
                    PNG or JPG files up to 10MB each. Recommended size: 1920x1080px (16:9 ratio)
                    <br />
                    <span className="font-medium">
                      Progress: {uploadedImages.length}/{selectedImageCount} images uploaded
                    </span>
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleImageUpload(e.target.files)}
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    id="image-upload"
                    disabled={uploadedImages.length >= selectedImageCount}
                  />
                  <Label
                    htmlFor="image-upload"
                    className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md cursor-pointer transition-colors ${
                      uploadedImages.length >= selectedImageCount
                        ? 'text-green-700 bg-green-100 cursor-not-allowed'
                        : 'text-white bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Image className="mr-2 h-5 w-5" />
                    {uploadedImages.length >= selectedImageCount ? 'All Images Added' : 'Choose Images'}
                  </Label>
                </div>

                {/* Real-time validation feedback */}
                {uploadedImages.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-blue-900 mb-2">Upload Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Images uploaded:</span>
                        <span className={uploadedImages.length === selectedImageCount ? 'text-green-600 font-medium' : 'text-blue-600'}>
                          {uploadedImages.length}/{selectedImageCount}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            uploadedImages.length === selectedImageCount ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${(uploadedImages.length / selectedImageCount) * 100}%` }}
                        ></div>
                      </div>
                      {uploadedImages.length < selectedImageCount && (
                        <p className="text-sm text-blue-700">
                          Upload {selectedImageCount - uploadedImages.length} more image(s) to proceed to checkout
                        </p>
                      )}
                    </div>
                  </div>
                )}

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

                {/* Ad Preview */}
                {imagePreviews.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Ad Preview</h3>
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden max-w-lg">
                      <img
                        src={imagePreviews[0]}
                        alt="Ad preview"
                        className="w-full h-full object-cover"
                      />
                      {applicationData?.qrUrl && (
                        <div className="absolute top-2 right-2 bg-white rounded p-1 w-12 h-12 flex items-center justify-center">
                          <div className="w-full h-full bg-gray-200 rounded text-xs flex items-center justify-center text-gray-500">QR</div>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded-full">
                        {applicationData?.businessName || "Your Business Name"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Upload Status with Database Save Feedback */}
                <div className={`border rounded-lg p-4 mb-6 transition-colors ${
                  isUploadingImages
                    ? 'bg-yellow-50 border-yellow-200'
                    : imagesSavedToDatabase
                    ? 'bg-green-50 border-green-200'
                    : uploadedImages.length === selectedImageCount
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center">
                    {isUploadingImages ? (
                      <div className="animate-spin h-5 w-5 border-2 border-yellow-600 border-t-transparent rounded-full mr-2" />
                    ) : imagesSavedToDatabase ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : uploadedImages.length === selectedImageCount ? (
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-600 mr-2" />
                    )}
                    <div>
                      <p className={`font-medium ${
                        isUploadingImages
                          ? 'text-yellow-900'
                          : imagesSavedToDatabase
                          ? 'text-green-900'
                          : uploadedImages.length === selectedImageCount
                          ? 'text-blue-900'
                          : 'text-gray-900'
                      }`}>
                        {isUploadingImages
                          ? 'Saving Images to Database...'
                          : imagesSavedToDatabase
                          ? 'Images Successfully Saved to Database'
                          : uploadedImages.length === selectedImageCount
                          ? 'All Images Ready - Click to Save'
                          : 'Upload Requirements'
                        }
                      </p>
                      <p className={`text-sm ${
                        isUploadingImages
                          ? 'text-yellow-700'
                          : imagesSavedToDatabase
                          ? 'text-green-700'
                          : uploadedImages.length === selectedImageCount
                          ? 'text-blue-700'
                          : 'text-gray-700'
                      }`}>
                        {isUploadingImages
                          ? `Uploading ${uploadedImages.length} image(s) to database. Please wait...`
                          : imagesSavedToDatabase
                          ? `${databaseImageUrls.length} image(s) permanently stored. Ready for checkout.`
                          : uploadedImages.length === selectedImageCount
                          ? `${uploadedImages.length} image(s) selected. Click "Proceed to Checkout" to save and continue.`
                          : `You must upload exactly ${selectedImageCount} image(s) to proceed to checkout.${
                              uploadedImages.length < selectedImageCount
                                ? ` You need ${selectedImageCount - uploadedImages.length} more image(s).`
                                : ''
                            }`
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={proceedToCheckout}
                  disabled={uploadedImages.length !== selectedImageCount || isUploadingImages}
                  size="lg"
                  className="w-full"
                >
                  {isUploadingImages ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Saving to Database...
                    </>
                  ) : imagesSavedToDatabase ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Proceed to Checkout
                    </>
                  ) : (
                    <>
                      Save Images & Proceed to Checkout
                      <CreditCard className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                {/* Reassuring message */}
                {uploadedImages.length === selectedImageCount && !imagesSavedToDatabase && (
                  <div className="text-center mt-4 text-sm text-gray-600">
                    <p>All images ready - Click above to save and continue to secure checkout</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {step === "checkout" && applicationData && (
          <>
            <div className="flex items-center mb-6">
              <Button variant="ghost" onClick={() => setStep("upload")} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Step 3: Complete Checkout</h1>
                <p className="text-gray-600">Review and complete your payment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Billing Period Selector */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-3 block">Billing Period</Label>
                    <RadioGroup
                      value={billingPeriod}
                      onValueChange={(value: 'monthly' | 'annual') => setBillingPeriod(value)}
                      className="grid grid-cols-1 gap-3"
                    >
                      <div className="relative">
                        <RadioGroupItem value="monthly" id="monthly" className="peer sr-only" />
                        <Label
                          htmlFor="monthly"
                          className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                            billingPeriod === 'monthly'
                              ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div>
                            <div className="font-medium">Monthly</div>
                            <div className="text-sm text-gray-500">${getPricing(selectedImageCount, 'monthly').amount}/month</div>
                          </div>
                          {billingPeriod === 'monthly' && (
                            <div className="ml-2">
                              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            </div>
                          )}
                        </Label>
                      </div>
                      <div className="relative">
                        <RadioGroupItem value="annual" id="annual" className="peer sr-only" />
                        <Label
                          htmlFor="annual"
                          className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                            billingPeriod === 'annual'
                              ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Annual</span>
                              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                                2 months free
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              ${getPricing(selectedImageCount, 'annual').amount}/year
                              <span className="text-green-600 ml-1">(Save ${(getPricing(selectedImageCount, 'annual') as any).savings})</span>
                            </div>
                          </div>
                          {billingPeriod === 'annual' && (
                            <div className="ml-2">
                              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            </div>
                          )}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Package</span>
                      <span className="font-medium">{getPricing(selectedImageCount).name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Images</span>
                      <span>{selectedImageCount} advertising slide(s)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Business</span>
                      <span>{applicationData.businessName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Billing</span>
                      <span className="capitalize">{billingPeriod}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>{billingPeriod === 'annual' ? 'Annual' : 'Monthly'} Total</span>
                      <span>${getPricing(selectedImageCount).amount}</span>
                    </div>
                    {billingPeriod === 'annual' && (
                      <div className="text-sm text-green-600 text-right">
                        You save ${(getPricing(selectedImageCount, 'annual') as any).savings} per year
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-900">Important: Authorization Hold Process</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          An authorization hold will be placed on your payment method for verification.
                          The charge will only be finalized upon application approval.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleStripeCheckout}
                    size="lg"
                    className="w-full mb-4"
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Complete Checkout with Stripe
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By proceeding, you authorize a payment hold that will be finalized only upon application approval.
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
