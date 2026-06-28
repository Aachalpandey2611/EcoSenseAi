import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassPanel } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Crown, Zap, Shield } from 'lucide-react';
import TiltCard from '@/components/ui/TiltCard';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/store/authStore';

import { useNavigate } from 'react-router-dom';

const tiers = [
  {
    name: 'Free',
    price: '₹0',
    description: 'Perfect for getting started with environmental tracking.',
    icon: <Zap className="w-6 h-6 text-[var(--primary)]" />,
    features: [
      'Basic dashboard and metrics',
      '3 OCR bill uploads lifetime',
      'Manual activity tracking',
      'Community leaderboard access',
    ],
    buttonText: 'Current Plan',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '₹199',
    interval: '/month',
    description: 'Unlock the full power of EcoSense AI to maximize your impact.',
    icon: <Crown className="w-6 h-6 text-yellow-400" />,
    features: [
      'Everything in Free',
      'Unlimited OCR bill uploads',
      'Full AI Green Coach access',
      'Advanced predictive analytics',
      'Access offset marketplace',
    ],
    buttonText: 'Upgrade to Pro',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For organizations looking to track and offset employee emissions.',
    icon: <Shield className="w-6 h-6 text-blue-400" />,
    features: [
      'Everything in Pro',
      'Organization dashboards',
      'Automated ESG/CSR reporting',
      'API access & webhook integration',
      'Dedicated account manager',
    ],
    buttonText: 'Contact Sales',
    highlighted: false,
  },
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Pricing() {
  const { user, setUser } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleProUpgrade = async () => {
    if (!user) {
      alert("Please log in to upgrade.");
      return;
    }

    try {
      setIsProcessing(true);
      // 1. Create Order on Backend
      const { data: order } = await apiClient.post('/payments/create-order');

      // HACKATHON DEMO FAILSAFE
      if (order.order_id === "demo_bypassed_order") {
        console.warn("Razorpay API blocked by network. Bypassing checkout for Demo mode.");
        await apiClient.post('/payments/verify', {
          razorpay_payment_id: "demo_payment",
          razorpay_order_id: "demo_bypassed_order",
          razorpay_signature: "demo_sig",
        });
        setUser({ ...user, subscription_tier: 'pro' });
        alert("Successfully upgraded to Pro! (Demo Fallback Mode)");
        setIsProcessing(false);
        navigate('/dashboard');
        return;
      }

      // 2. Initialize Razorpay
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "EcoSense AI",
        description: "Upgrade to Pro Tier",
        order_id: order.order_id,
        prefill: {
          name: user.full_name,
          email: user.email,
        },
        theme: {
          color: "#10b981", // brand-500
        },
        handler: async function (response: any) {
          try {
            // 3. Verify Payment on Backend
            await apiClient.post('/payments/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            
            // 4. Update local user state
            setUser({ ...user, subscription_tier: 'pro' });
            alert("Successfully upgraded to Pro! Thank you.");
            navigate('/dashboard');
          } catch (err) {
            console.error("Verification failed", err);
            alert("Payment verification failed. Please contact support.");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error(response.error);
        alert("Payment failed! " + response.error.description);
      });
      rzp.open();
    } catch (err) {
      console.error("Order creation failed", err);
      alert("Could not initiate payment. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-4"
          >
            Simple, transparent pricing
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[var(--muted-foreground)]"
          >
            Choose the plan that best fits your journey towards a sustainable future.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, index) => {
            // Determine button state based on user's current tier
            const isCurrentTier = user?.subscription_tier === tier.name.toLowerCase();
            const isDowngrade = user?.subscription_tier === 'enterprise' && tier.name !== 'Enterprise';
            
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`relative ${tier.highlighted ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                    <span className="bg-[var(--primary)] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <TiltCard className="h-full">
                  <GlassPanel className={`h-full flex flex-col p-8 ${
                    tier.highlighted 
                      ? 'border-[var(--primary)]/50 shadow-[0_4px_30px_rgba(16,185,129,0.15)] bg-[var(--card)]/90' 
                      : 'border-[var(--border)] bg-[var(--card)]/60'
                  }`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        tier.highlighted ? 'bg-[var(--primary)]/20' : 'bg-[var(--card)] shadow-sm'
                      }`}>
                        {tier.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-[var(--foreground)]">{tier.name}</h3>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-[var(--foreground)]">{tier.price}</span>
                        {tier.interval && (
                          <span className="text-[var(--muted-foreground)]">{tier.interval}</span>
                        )}
                      </div>
                      <p className="text-[var(--muted-foreground)] text-sm mt-2 min-h-[40px]">
                        {tier.description}
                      </p>
                    </div>

                    <div className="flex-1 space-y-4 mb-8">
                      {tier.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
                          <span className="text-[var(--foreground)] text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      variant={tier.highlighted ? 'primary' : 'secondary'}
                      className="w-full shadow-sm"
                      disabled={isCurrentTier || isDowngrade || (tier.name === 'Pro' && isProcessing)}
                      onClick={() => {
                        if (tier.name === 'Pro') {
                          handleProUpgrade();
                        } else if (tier.name === 'Enterprise') {
                          alert('TODO: open contact sales form');
                        }
                      }}
                    >
                      {isCurrentTier 
                        ? 'Current Plan' 
                        : isProcessing && tier.name === 'Pro' 
                          ? 'Processing...' 
                          : tier.buttonText}
                    </Button>
                  </GlassPanel>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
