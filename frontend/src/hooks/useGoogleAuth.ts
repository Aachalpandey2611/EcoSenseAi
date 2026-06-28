import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export function useGoogleAuth(onToken: (idToken: string) => Promise<void>) {
  const signInWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // useGoogleLogin with flow="implicit" (default) returns an access_token.
        // We need to fetch the user info manually to get an id-like token,
        // or just let our backend use the access_token.
        // Wait, our backend expects an ID token! 
        // We can use the openid endpoint or just change the flow.
      } catch (err) {
        console.error('Google Auth Error:', err);
      }
    },
    onError: (error) => console.error('Login Failed:', error),
  });

  return { signInWithGoogle };
}
