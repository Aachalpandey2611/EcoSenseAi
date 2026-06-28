import { create } from 'zustand';

interface SubscriptionState {
  isUpgradeModalOpen: boolean;
  upgradeMessage: string;
  openUpgradeModal: (message?: string) => void;
  closeUpgradeModal: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isUpgradeModalOpen: false,
  upgradeMessage: 'Unlock premium features to supercharge your eco journey.',
  openUpgradeModal: (message) => set({ 
    isUpgradeModalOpen: true, 
    upgradeMessage: message || 'Unlock premium features to supercharge your eco journey.' 
  }),
  closeUpgradeModal: () => set({ isUpgradeModalOpen: false }),
}));
