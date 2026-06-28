import { useEffect, useCallback, useRef } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (notification?: (n: any) => void) => void;
        };
      };
    };
  }
}

export function useGoogleAuth(onToken: (idToken: string) => Promise<void>) {
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    if (document.getElementById('google-gsi-script')) return;
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  const signInWithGoogle = useCallback(() => {
    const initAndPrompt = () => {
      if (!window.google?.accounts?.id) {
        setTimeout(initAndPrompt, 200);
        return;
      }
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          if (response.credential) {
            await onTokenRef.current(response.credential);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
          console.warn('Google prompt not shown:', notification.getNotDisplayedReason?.());
        }
      });
    };
    initAndPrompt();
  }, []);

  return { signInWithGoogle };
}
