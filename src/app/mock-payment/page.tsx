"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreditCard, Check, X, ArrowLeft } from "lucide-react";

export default function MockPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const planId = searchParams.get('planId') || 'basic';
  const price = searchParams.get('price') || '90';
  const interval = searchParams.get('interval') || 'year';
  const userId = searchParams.get('userId') || '';
  const email = searchParams.get('email') || '';

  const planNames: Record<string, string> = {
    basic: 'Basic',
    pro: 'Pro',
    max: 'Max'
  };

  const handlePaymentSuccess = async () => {
    setIsProcessing(true);

    // 模拟支付处理时间
    setTimeout(() => {
      // 模拟Creem成功支付后的跳转，包含订单信息
      const successUrl = `${window.location.origin}/success?plan=${planId}&mock=true&checkout_id=ch_mock_${Date.now()}&order_id=ord_mock_${Date.now()}`;
      window.location.href = successUrl;
    }, 2000);
  };

  const handlePaymentCancel = () => {
    router.push('/pricing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-sm">🍌</span>
              </div>
              <span className="text-xl font-bold">Nano Banana - Mock Payment</span>
            </div>
            <Button
              variant="outline"
              onClick={handlePaymentCancel}
              className="text-gray-300 border-gray-600 hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pricing
            </Button>
          </div>
        </div>
      </header>

      {/* Payment Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <Card className="max-w-md w-full p-8 bg-gray-900 border-gray-700">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Mock Payment Gateway
            </h1>
            <p className="text-gray-400 text-sm">
              🚧 Development Environment - No Real Charges
            </p>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-white mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Plan:</span>
                <span className="text-white">{planNames[planId]} Plan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Billing:</span>
                <span className="text-white">{interval === 'year' ? 'Annual' : 'Monthly'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white text-xs">{email}</span>
              </div>
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-300">Total:</span>
                  <span className="text-white">${price} USD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mock Payment Form */}
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-sm">
                <strong>Test Mode:</strong> This is a simulated payment. Click "Complete Payment" to simulate a successful transaction.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handlePaymentSuccess}
                disabled={isProcessing}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Complete Payment
                  </>
                )}
              </Button>

              <Button
                onClick={handlePaymentCancel}
                variant="outline"
                disabled={isProcessing}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              In production, this would be the real Creem.io payment page
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}