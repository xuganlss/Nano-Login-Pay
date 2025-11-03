"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Sparkles, Zap, Star, ArrowRight, User, LogOut, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  credits: number;
  features: string[];
  popular?: boolean;
  color: string;
}

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userCredits, setUserCredits] = useState<{
    total_credits: number;
    used_credits: number;
    available_credits: number;
  } | null>(null);
  const supabase = createClient();

  // 检查用户登录状态
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setUserLoading(false);

      // 如果用户已登录，获取积分信息
      if (user) {
        fetchUserCredits();
      }
    };

    checkUser();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setUserLoading(false);

      // 如果用户已登录，获取积分信息
      if (session?.user) {
        fetchUserCredits();
      } else {
        setUserCredits(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // 获取用户积分
  const fetchUserCredits = async () => {
    try {
      const response = await fetch('/api/credits');
      if (response.ok) {
        const credits = await response.json();
        setUserCredits(credits);
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    }
  };

  // 退出登录
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const plans: PricingPlan[] = [
    {
      id: "basic",
      name: "Basic",
      monthlyPrice: 15,
      yearlyPrice: 90, // 50% off
      credits: 1800,
      features: [
        "1,800 credits/year",
        "Standard generation speed",
        "Email support",
        "Basic features",
        "Single user"
      ],
      color: "from-yellow-400 to-orange-500"
    },
    {
      id: "pro",
      name: "Pro",
      monthlyPrice: 50,
      yearlyPrice: 300, // 50% off
      credits: 9600,
      features: [
        "9,600 credits/year",
        "Faster generation speed",
        "Priority support",
        "Advanced features",
        "Batch processing",
        "Commercial use license"
      ],
      popular: true,
      color: "from-orange-400 to-red-500"
    },
    {
      id: "max",
      name: "Max",
      monthlyPrice: 230,
      yearlyPrice: 1380, // 50% off
      credits: 55200,
      features: [
        "55,200 credits/year",
        "Fastest generation speed",
        "24/7 priority support",
        "All features included",
        "Advanced batch processing",
        "Commercial use license",
        "API access",
        "Custom integrations"
      ],
      color: "from-red-400 to-pink-500"
    }
  ];

  const handleSelectPlan = async (plan: PricingPlan) => {
    if (!user) {
      // 重定向到登录页面
      window.location.href = '/login';
      return;
    }

    // 这里集成 Creem 支付
    try {
      const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
      const interval = isYearly ? 'year' : 'month';

      // 调用 Creem API 创建支付会话
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          price,
          interval,
          userId: user.id,
          userEmail: user.email || user.user_metadata?.email
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        console.error('Payment error:', data);
        alert('支付系统暂时不可用，请稍后再试');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('支付系统错误，请稍后再试');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-sm">🍌</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                <Link href="/">Nano Banana</Link>
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-orange-600 transition-colors">Image Editor</Link>
              <Link href="/#showcase" className="text-gray-700 hover:text-orange-600 transition-colors">Showcase</Link>
              <Link href="/pricing" className="text-orange-600 font-semibold">Pricing</Link>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {userLoading ? (
                <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"></div>
              ) : user ? (
                <div className="flex items-center space-x-3">
                  {/* Credits Display with Buy Credits */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 rounded-full px-3 py-1.5 transition-colors">
                      <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">+</span>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-green-700 font-semibold">
                          {userCredits ? userCredits.available_credits : '...'} credits
                        </span>
                        {userCredits && userCredits.available_credits === 0 && (
                          <span className="text-xs text-red-600">Low balance</span>
                        )}
                      </div>
                      <ChevronDown className="w-3 h-3 text-green-600" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="right-0">
                      <DropdownMenuItem onClick={() => window.location.href = '/pricing'}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Buy Credits
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = '/dashboard'}>
                        <User className="w-4 h-4 mr-2" />
                        View Usage
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* User Profile */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center space-x-2 hover:bg-gray-100 rounded-full p-2 transition-colors">
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="用户头像"
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <User className="w-8 h-8 p-1 bg-gray-200 rounded-full" />
                      )}
                      <span className="hidden sm:inline text-gray-700 font-medium">
                        {user.user_metadata?.user_name || user.email?.split('@')[0] || 'User'}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="right-0">
                      <DropdownMenuItem onClick={() => window.location.href = '/dashboard'}>
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <>
                  <Button variant="outline" className="hidden sm:inline-flex">
                    <a href="/login">Sign In</a>
                  </Button>
                  <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Launch Now
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 mb-6 px-4 py-2">
            🍌 Limited Time: Save 50% with Annual Billing
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 bg-clip-text text-transparent mb-6">
            Choose Your Plan
          </h1>

          <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto">
            Unlock the full power of Nano Banana AI image editing. Perfect for creators, professionals, and businesses.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-lg font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-yellow-500 data-[state=checked]:to-orange-500"
            />
            <span className={`text-lg font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge className="bg-green-100 text-green-800 ml-2">
                Save 50%
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const isCurrentlyHighlighted = hoveredPlan ? hoveredPlan === plan.id : plan.popular;

              return (
                <Card
                  key={plan.id}
                  className={`relative p-8 ${isCurrentlyHighlighted ? 'ring-2 ring-orange-500 scale-105' : ''} bg-white hover:shadow-xl hover:ring-2 hover:ring-orange-400 hover:scale-105 transition-all duration-300 cursor-pointer`}
                  onClick={() => handleSelectPlan(plan)}
                  onMouseEnter={() => setHoveredPlan(plan.id)}
                  onMouseLeave={() => setHoveredPlan(null)}
                >
                  {isCurrentlyHighlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1">
                        <Star className="w-4 h-4 mr-1" />
                        {hoveredPlan ? 'Selected' : 'Most Popular'}
                      </Badge>
                    </div>
                  )}

                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl mx-auto mb-4 flex items-center justify-center`}>
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-gray-600 ml-1">
                      /{isYearly ? 'year' : 'month'}
                    </span>
                  </div>

                  {isYearly && (
                    <div className="text-sm text-gray-500 line-through">
                      ${plan.monthlyPrice * 12}/year
                    </div>
                  )}

                  <div className="text-lg font-semibold text-orange-600 mt-2">
                    {plan.credits.toLocaleString()} credits
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full py-3 ${plan.popular
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {user ? (
                    <>
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    'Sign In to Subscribe'
                  )}
                </Button>
              </Card>
            );
          })}
          </div>

          {/* Additional Info */}
          <div className="text-center mt-16">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Need More Credits?</h3>
              <p className="text-gray-600 mb-6">
                For high-volume usage or custom enterprise solutions, contact our sales team for personalized pricing.
              </p>
              <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What's Included</h2>
            <p className="text-gray-600">All plans include our core AI editing features</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: "AI Image Editing",
                description: "Natural language image transformation"
              },
              {
                icon: Star,
                title: "Character Consistency",
                description: "Maintain perfect character details"
              },
              {
                icon: Sparkles,
                title: "One-Shot Editing",
                description: "Perfect results in single attempt"
              },
              {
                icon: Check,
                title: "Commercial License",
                description: "Use for business and marketing"
              }
            ].map((feature, index) => (
              <Card key={index} className="p-6 bg-white text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-md flex items-center justify-center">
                <span className="text-xs">🍌</span>
              </div>
              <span className="text-gray-600">2025 nanobanana.ai All rights reserved.</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-orange-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-orange-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-orange-600 transition-colors">Refund Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}