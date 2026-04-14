import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">⚔️</span>
          <h1 className="mt-3 text-2xl font-bold text-wow-gold">WoW Auction Sniper</h1>
          <p className="mt-1 text-wow-muted text-sm">Create an account to track prices and set snipe alerts</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-wow-card border border-wow-border shadow-none rounded-xl',
              headerTitle: 'text-wow-text',
              headerSubtitle: 'text-wow-muted',
              formFieldLabel: 'text-wow-muted text-sm',
              formFieldInput:
                'bg-wow-dark border-wow-border text-wow-text focus:border-wow-gold rounded-md',
              formButtonPrimary:
                'bg-wow-gold hover:bg-wow-gold-light text-wow-dark font-bold rounded-lg',
              footerActionLink: 'text-wow-gold hover:text-wow-gold-light',
              dividerLine: 'bg-wow-border',
              dividerText: 'text-wow-muted',
              socialButtonsBlockButton:
                'border-wow-border text-wow-text hover:bg-wow-dark rounded-lg',
            },
          }}
        />
      </div>
    </div>
  )
}
