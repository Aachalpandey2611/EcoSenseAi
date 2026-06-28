import { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import Earth from '@/pages/landing/Earth';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/Card';
import { AlertCircle, ChevronRight, MapPin, Users, Home, Car } from 'lucide-react';
import { Input } from '@/components/ui/Input';

const onboardingSchema = z.object({
  location: z.string().min(1, "Location is required"),
  household_size: z.string().min(1, "Please select household size"),
  home_type: z.string().min(1, "Please select home type"),
  vehicle_type: z.string().min(1, "Please select vehicle type"),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const OPTIONS = {
  household_size: ['1', '2', '3', '4', '5+'],
  home_type: ['Apartment', 'House', 'Tiny Home'],
  vehicle_type: ['No Vehicle (Public Transit/Bike)', 'EV', 'Hybrid', 'Gas (Efficient)', 'Gas (Heavy/SUV)'],
};

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLocating, setIsLocating] = useState(true);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      location: '',
      household_size: '',
      home_type: '',
      vehicle_type: '',
    },
  });

  useEffect(() => {
    // Attempt to auto-detect location
    const fetchLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data.city && data.country_name) {
            setValue('location', `${data.city}, ${data.country_name}`);
          }
        }
      } catch (err) {
        console.log("Could not auto-detect location");
      } finally {
        setIsLocating(false);
      }
    };
    fetchLocation();
  }, [setValue]);

  const onSubmit = async (data: OnboardingFormValues) => {
    setIsSubmitting(true);
    setError('');
    try {
      // We pass the required hidden fields to satisfy the backend model
      const result = await authApi.submitOnboarding({
        ...data,
        diet_pattern: "Omnivore",
        electricity_usage: "Average"
      });
      
      const user = await authApi.getMe();
      setUser(user);
      
      // Store the initial eco score in sessionStorage so dashboard can pick it up immediately
      sessionStorage.setItem('initial_eco_score', result.eco_score.toString());
      sessionStorage.setItem('show_score_celebration', 'true');
      
      navigate('/dashboard');
    } catch (err: any) {
      setError("Network error while saving your profile. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 3D Earth Preview Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-30 pointer-events-none z-0">
        <Suspense fallback={null}>
          <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
            <Earth />
          </Canvas>
        </Suspense>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <GlassPanel className="p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)] bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--border)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-[var(--foreground)] mb-2">Let's set up your profile</h2>
              <p className="text-[var(--muted-foreground)] text-sm">Tell us a bit about your lifestyle to get your starting Eco Score.</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--primary)]" /> Region / Location
                </label>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder={isLocating ? "Detecting location..." : "City, Country"}
                      disabled={isLocating}
                      className="min-h-[44px]"
                    />
                  )}
                />
                {errors.location && <p className="text-red-400 text-xs">{errors.location.message}</p>}
              </div>

              {/* Household Size */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--primary)]" /> Household Size
                </label>
                <Controller
                  name="household_size"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-5 gap-2">
                      {OPTIONS.household_size.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => field.onChange(opt)}
                          className={`min-h-[44px] rounded-lg border transition-all ${
                            field.value === opt
                              ? 'bg-[var(--primary)]/20 border-[var(--primary)] text-brand-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                              : 'bg-[var(--card)]/50 border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]/50 hover:bg-[var(--card)]/50'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                />
                {errors.household_size && <p className="text-red-400 text-xs">{errors.household_size.message}</p>}
              </div>

              {/* Home Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                  <Home className="w-4 h-4 text-[var(--primary)]" /> Home Type
                </label>
                <Controller
                  name="home_type"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-3 gap-2">
                      {OPTIONS.home_type.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => field.onChange(opt)}
                          className={`min-h-[44px] rounded-lg border text-sm transition-all ${
                            field.value === opt
                              ? 'bg-[var(--primary)]/20 border-[var(--primary)] text-brand-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                              : 'bg-[var(--card)]/50 border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]/50 hover:bg-[var(--card)]/50'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                />
                {errors.home_type && <p className="text-red-400 text-xs">{errors.home_type.message}</p>}
              </div>

              {/* Vehicle Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                  <Car className="w-4 h-4 text-[var(--primary)]" /> Primary Transport
                </label>
                <Controller
                  name="vehicle_type"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {OPTIONS.vehicle_type.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => field.onChange(opt)}
                          className={`min-h-[44px] p-2 rounded-lg border text-sm transition-all ${
                            field.value === opt
                              ? 'bg-[var(--primary)]/20 border-[var(--primary)] text-brand-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                              : 'bg-[var(--card)]/50 border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]/50 hover:bg-[var(--card)]/50'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                />
                {errors.vehicle_type && <p className="text-red-400 text-xs">{errors.vehicle_type.message}</p>}
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full min-h-[48px] text-lg" isLoading={isSubmitting}>
                  Generate Eco Score <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

            </form>
          </motion.div>
        </GlassPanel>
      </div>
    </div>
  );
}
