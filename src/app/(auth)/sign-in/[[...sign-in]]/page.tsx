import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <SignIn
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#facc15',
          colorBackground: 'transparent',
          colorText: '#e4e2e3',
          colorTextSecondary: '#64748b',
          colorInputBackground: '#0d0d0e',
          colorInputText: '#ffffff',
          borderRadius: '8px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
        },
        elements: {
          card: 'bg-transparent shadow-none border-none p-0',
          headerTitle: 'hidden',
          headerSubtitle: 'hidden',
          header: 'hidden',
          socialButtonsBlockButton:
            'rounded-lg text-sm font-medium bg-[#0d0d0e] border border-[#1a1a1b] text-[#e4e2e3] hover:bg-[#141414] hover:border-[#facc15]/30 transition-all duration-200',
          socialButtonsBlockButtonText: 'font-medium',
          dividerLine: 'bg-[#1a1a1b]',
          dividerText: 'text-[#45474c] font-[JetBrains_Mono] text-xs tracking-widest',
          formFieldLabel: 'text-[#64748b] text-xs font-medium tracking-wide uppercase',
          formFieldInput:
            'rounded-lg text-sm bg-[#0d0d0e] border-[#1a1a1b] text-white placeholder-[#45474c] focus:border-[#facc15]/50 focus:shadow-[0_0_0_1px_rgba(250,204,21,0.2)] transition-all duration-200',
          formButtonPrimary:
            'rounded-lg text-sm font-bold bg-[#facc15] text-[#0a0a0a] hover:bg-[#fde047] transition-all duration-200 shadow-[0_0_20px_rgba(250,204,21,0.2)] mt-1',
          footerActionLink: 'text-[#facc15] hover:text-[#fde047] transition-colors',
          footerActionText: 'text-[#64748b]',
          identityPreview: 'bg-[#0d0d0e] border border-[#1a1a1b] rounded-lg',
          identityPreviewText: 'text-[#e4e2e3]',
          identityPreviewEditButton: 'text-[#facc15]',
          otpCodeFieldInput:
            'bg-[#0d0d0e] border border-[#1a1a1b] text-white rounded-lg focus:border-[#facc15]/50',
          formResendCodeLink: 'text-[#facc15]',
          alertText: 'text-[#e4e2e3]',
          alert: 'bg-[#0d0d0e] border border-[#ef4444]/20 rounded-lg',
          footer: 'bg-transparent border-t border-[#1a1a1b] mt-4',
        },
      }}
    />
  );
}
