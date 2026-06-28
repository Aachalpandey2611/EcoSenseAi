import { motion, AnimatePresence } from 'framer-motion';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { GlassPanel } from '../ui/Card';
import { Button } from '../ui/Button';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function UpgradeModal() {
  const { isUpgradeModalOpen, closeUpgradeModal, upgradeMessage } = useSubscriptionStore();
  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    closeUpgradeModal();
    navigate('/pricing');
  };

  return (
    <AnimatePresence>
      {isUpgradeModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeUpgradeModal}
            className="fixed inset-0 z-50 bg-[var(--background)]/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <GlassPanel className="p-1 relative overflow-hidden border-[var(--primary)]/30">
                {/* Glow effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/20 rounded-full blur-[80px] -z-10 transform translate-x-1/2 -translate-y-1/2" />
                
                <div className="p-6 bg-[var(--card)]/90 rounded-[1.2rem] backdrop-blur-md">
                  <button
                    onClick={closeUpgradeModal}
                    className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center mb-6 border border-[var(--primary)]/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <Sparkles className="w-6 h-6 text-[var(--primary)]" />
                  </div>

                  <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">Upgrade to Pro</h3>
                  <p className="text-[var(--foreground)] mb-6 leading-relaxed">
                    {upgradeMessage}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {[
                      'Unlimited OCR uploads',
                      'Full AI Green Coach access',
                      'Advanced environmental predictions',
                      'Access offset marketplace'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-[var(--foreground)]">
                        <CheckCircle2 className="w-5 h-5 text-[var(--primary)] shrink-0" />
                        <span className="text-sm font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={closeUpgradeModal}
                    >
                      Maybe Later
                    </Button>
                    <Button
                      className="flex-1 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                      onClick={handleUpgradeClick}
                    >
                      View Pricing
                    </Button>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
