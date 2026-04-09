"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/navigation';

interface MissingApplication {
  id: number;
  business_name: string;
  status: string;
  has_image: boolean;
}

export default function ResubmitPage() {
  const [email, setEmail] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [step, setStep] = useState<'search' | 'upload' | 'success'>('search');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Query to find applications with missing images by email
  const { data: applications, isLoading, error } = useQuery<MissingApplication[]>({
    queryKey: ['/api/applications/missing-images', email],
    enabled: !!email && email.includes('@'),
    queryFn: async () => {
      const response = await fetch(`/api/applications/missing-images/${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      return response.json();
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ applicationId, file }: { applicationId: number; file: File }) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('applicationId', applicationId.toString());
      formData.append('contactEmail', email);

      const response = await fetch('/api/applications/resubmit-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your advertisement image has been uploaded successfully.",
      });
      setStep('success');
      // Invalidate both the missing images query and the applications query
      queryClient.invalidateQueries({ queryKey: ['/api/applications/missing-images'] });
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });

      // Refresh the search results to show updated status
      queryClient.invalidateQueries({ queryKey: ['/api/applications/missing-images', email] });

      // Reset the form state
      setSelectedFile(null);
      setSelectedApplicationId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file (PNG, JPG, JPEG, GIF)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !selectedApplicationId) return;

    uploadMutation.mutate({
      applicationId: selectedApplicationId,
      file: selectedFile
    });
  };

  const handleSearch = () => {
    if (email && email.includes('@')) {
      // Query will trigger automatically due to enabled condition
    } else {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Re-submit Your Advertisement Image
          </h1>
          <p className="text-lg text-gray-600">
            We experienced a technical issue that affected some recently uploaded images.
            Please re-upload your advertisement image to continue with your application.
          </p>
        </div>

        {step === 'search' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span>Find Your Application</span>
              </CardTitle>
              <CardDescription>
                Enter the email address you used for your application to check if your images need to be re-uploaded.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Unable to search for applications. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              {applications && applications.length === 0 && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Great news! No missing images found for this email address. All your applications are complete.
                  </AlertDescription>
                </Alert>
              )}

              {applications && applications.length > 0 && (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Found {applications.length} application(s) with missing images that need to be re-uploaded.
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-4">
                    {applications.map((app) => (
                      <Card key={app.id} className="border-orange-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{app.business_name}</h3>
                              <p className="text-sm text-gray-600">
                                Status: <Badge variant="secondary">{app.status}</Badge>
                              </p>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedApplicationId(app.id);
                                setStep('upload');
                              }}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Re-upload Image
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 'upload' && selectedApplicationId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5 text-blue-600" />
                <span>Upload Your Advertisement Image</span>
              </CardTitle>
              <CardDescription>
                Please select and upload your advertisement image. This should be a high-quality image in 16:9 aspect ratio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-upload">Advertisement Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700">
                      {selectedFile ? selectedFile.name : 'Click to select an image'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      PNG, JPG, JPEG, or GIF (max 5MB)
                    </p>
                  </label>
                </div>
              </div>

              {selectedFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">File Selected</p>
                        <p className="text-sm text-green-600">
                          {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {uploadMutation.isPending ? 'Uploading...' : 'Upload Image'}
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep('search')}
                  disabled={uploadMutation.isPending}
                >
                  Back to Search
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Upload Successful!
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Your advertisement image has been successfully uploaded and your application is now complete.
              </p>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Our team will review your application and contact you soon.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => {
                      setStep('search');
                      setSelectedFile(null);
                      setSelectedApplicationId(null);
                    }}
                    variant="outline"
                  >
                    Upload Another Image
                  </Button>
                  <Button
                    onClick={() => router.push('/')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Return to Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
