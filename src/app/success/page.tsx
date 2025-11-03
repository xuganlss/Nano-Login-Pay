"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, ArrowRight } from "lucide-react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const isMock = searchParams.get('mock') === 'true';
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟加载时间
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const planNames: Record<string, string> = {
    basic: 'Basic',
    pro: 'Pro',
    max: 'Max'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing your payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your subscription.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-sm">🍌</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                <Link href="/">Nano Banana</Link>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Success Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <Card className="max-w-md w-full p-8 text-center bg-white shadow-xl">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Check className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>

          <p className="text-gray-600 mb-6">
            Thank you for subscribing to the{' '}
            <span className="font-semibold text-orange-600">
              {planNames[plan || 'basic'] || 'Basic'} Plan
            </span>
            . Your subscription is now {isMock ? 'simulated (development mode)' : 'active'}.
          </p>

          <div className={`${isMock ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'} rounded-lg p-4 mb-6`}>
            <h3 className={`font-semibold ${isMock ? 'text-blue-800' : 'text-green-800'} mb-2`}>
              {isMock ? 'Development Mode' : "What's Next?"}
            </h3>
            <ul className={`text-sm ${isMock ? 'text-blue-700' : 'text-green-700'} space-y-1 text-left`}>
              {isMock ? (
                <>
                  <li>• This is a simulated payment for testing</li>
                  <li>• No real charge has been made</li>
                  <li>• Configure Creem API for production</li>
                </>
              ) : (
                <>
                  <li>• Access to all premium AI editing features</li>
                  <li>• Your credits have been added to your account</li>
                  <li>• Start creating amazing images right away</li>
                </>
              )}
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              onClick={() => window.location.href = '/dashboard'}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              Start Creating
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            You will receive a confirmation email shortly.
          </p>
        </Card>
      </div>
    </div>
  );
}