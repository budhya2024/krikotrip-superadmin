import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldAlert,
  XCircle,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import brandLogo from '../assets/images/brand-logo.png'
import { authClient } from '../lib/auth-client'

const step1Schema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Please enter a valid email address'),
})

type Step1FormValues = z.infer<typeof step1Schema>

const step2Schema = z
  .object({
    otp: z.string().trim().min(4, 'Verification code is required'),
    password: z
      .string()
      .min(14, 'Password must be at least 14 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one symbol'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type Step2FormValues = z.infer<typeof step2Schema>

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) {
      return
    }
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    formState: { errors: errorsStep1, isSubmitting: isSubmittingStep1 },
  } = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: { email: '' },
  })

  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    control: controlStep2,
    formState: { errors: errorsStep2, isSubmitting: isSubmittingStep2 },
  } = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      otp: '',
      password: '',
      confirmPassword: '',
    },
  })

  const currentPassword = useWatch({ control: controlStep2, name: 'password' }) || ''

  const ruleLength = currentPassword.length >= 14
  const ruleUpper = /[A-Z]/.test(currentPassword)
  const ruleLower = /[a-z]/.test(currentPassword)
  const ruleNumber = /[0-9]/.test(currentPassword)
  const ruleSymbol = /[^A-Za-z0-9]/.test(currentPassword)

  const onSendOtp = async (values: Step1FormValues) => {
    setAuthError(null)
    try {
      await authClient.emailOtp.sendVerificationOtp({
        email: values.email,
        type: 'forget-password',
      })
    } catch (err: unknown) {
      void err
    } finally {
      setSubmittedEmail(values.email)
      setResendCooldown(30)
      setStep(2)
    }
  }

  const onResendOtp = async () => {
    if (resendCooldown > 0 || !submittedEmail) {
      return
    }
    setAuthError(null)
    try {
      await authClient.emailOtp.sendVerificationOtp({
        email: submittedEmail,
        type: 'forget-password',
      })
      setResendCooldown(30)
      toast.info('Verification code resent if account exists.')
    } catch {
      setAuthError('Failed to resend code. Please try again.')
    }
  }

  const onResetPassword = async (values: Step2FormValues) => {
    setAuthError(null)
    try {
      const res = await authClient.emailOtp.resetPassword({
        email: submittedEmail,
        otp: values.otp,
        password: values.password,
      })

      if (res?.error) {
        const msg = res.error.message?.toLowerCase() ?? ''
        if (msg.includes('invalid') || msg.includes('otp') || msg.includes('code')) {
          setAuthError('Invalid or expired verification code.')
          return
        }
        if (msg.includes('rate limit') || msg.includes('too many')) {
          setAuthError('Too many attempts. Please try again later.')
          return
        }
        setAuthError(res.error.message || 'Failed to reset password.')
        return
      }

      toast.success('Password updated successfully. Please sign in.')
      navigate('/login')
    } catch {
      setAuthError('Unable to reset password. Please check your connection.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center mb-4">
          <img
            src={brandLogo}
            alt="KrikoTrip"
            className="h-10 w-auto object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Reset Admin Password
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {step === 1
            ? 'Enter your registered email address to receive a verification code.'
            : 'Enter the code sent to your email and set a new secure password.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 sm:px-10">
          {authError && (
            <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-950/40 p-4 border border-red-200 dark:border-red-900/50 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {authError}
              </p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSubmitStep1(onSendOtp)} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    disabled={isSubmittingStep1}
                    {...registerStep1('email')}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                      errorsStep1.email
                        ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-500'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500'
                    }`}
                    placeholder="admin@krikotrip.com"
                  />
                </div>
                {errorsStep1.email && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                    {errorsStep1.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingStep1}
                className="w-full mt-2 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 transition-all cursor-pointer"
              >
                {isSubmittingStep1 ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmitStep2(onResetPassword)} className="space-y-5">
              <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300 truncate max-w-[220px]">
                  {submittedEmail}
                </span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="otp"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                  >
                    Verification Code
                  </label>
                  <button
                    type="button"
                    disabled={resendCooldown > 0}
                    onClick={onResendOtp}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {resendCooldown > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Resend in {resendCooldown}s
                      </span>
                    ) : (
                      'Resend Code'
                    )}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    id="otp"
                    type="text"
                    disabled={isSubmittingStep2}
                    {...registerStep2('otp')}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm font-mono tracking-widest bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                      errorsStep2.otp
                        ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-500'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500'
                    }`}
                    placeholder="123456"
                  />
                </div>
                {errorsStep2.otp && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                    {errorsStep2.otp.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    disabled={isSubmittingStep2}
                    {...registerStep2('password')}
                    className={`w-full pl-9 pr-10 py-2.5 rounded-lg border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                      errorsStep2.password
                        ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-500'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500'
                    }`}
                    placeholder="At least 14 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[11px]">
                  <div
                    className={`flex items-center gap-1.5 ${
                      ruleLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {ruleLength ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>14+ characters</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      ruleUpper ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {ruleUpper ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>Uppercase (A-Z)</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      ruleLower ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {ruleLower ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>Lowercase (a-z)</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      ruleNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {ruleNumber ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>Number (0-9)</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 col-span-2 ${
                      ruleSymbol ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {ruleSymbol ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>Special character (!@#$%^&*)</span>
                  </div>
                </div>
                {errorsStep2.password && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                    {errorsStep2.password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    disabled={isSubmittingStep2}
                    {...registerStep2('confirmPassword')}
                    className={`w-full pl-9 pr-10 py-2.5 rounded-lg border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                      errorsStep2.confirmPassword
                        ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-500'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500'
                    }`}
                    placeholder="Repeat new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errorsStep2.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                    {errorsStep2.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingStep2}
                className="w-full mt-2 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 transition-all cursor-pointer"
              >
                {isSubmittingStep2 ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
