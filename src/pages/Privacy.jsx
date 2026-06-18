import { Shield, Lock, Eye, FileText, CheckCircle } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-[calc(100vh-200px)] bg-background py-16 px-6">
      <div className="max-w-3xl mx-auto bg-card border border-border rounded-[32px] p-8 sm:p-12 shadow-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          <div className="text-center border-b border-border pb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold font-heading text-primary tracking-tight">Privacy Policy</h1>
            <p className="text-muted-foreground text-sm mt-2">Last Updated: June 2026</p>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed">
            At Paper Plane, we value your trust and are committed to protecting your personal data. This Privacy Policy explains how we collect, store, process, and protect your information when you use our AI Gift Box Visual Layout Suggester application.
          </p>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-secondary text-primary flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-primary text-sm">1. Secure Data Storage</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  All personal data (such as recipient details, custom box engraving messages, and delivery addresses) are handled securely. We employ standard database encryption methods to prevent unauthorized access.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-secondary text-primary flex items-center justify-center flex-shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-primary text-sm">2. AI Recommendations Privacy</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  The products you choose and occasions you select are processed solely to compute the visual packaging suggestions. We do not sell, trade, or distribute your layout history or corporate gifting data to third parties.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-secondary text-primary flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-primary text-sm">3. Order Fulfillment Records</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Order tracking coordinates, return inquiries, and B2B corporate new-hire lists are persisted locally inside the sqlite database. They are accessed only by authorized production managers to facilitate prompt shipping.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-secondary text-primary flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-primary text-sm">4. Cookies & Session Management</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  We use cookies and localStorage exclusively to persist your user credentials (admin/customer/corporate logs) and maintain your design session. You can disable cookies in your browser settings at any time.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-secondary text-primary flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-primary text-sm">5. Data Access Rights & Customization</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  You have the right to view, download, or request full deletion of any stored data (such as address books, order logs, layout history, and messages) associated with your profile.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-secondary text-primary flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-primary text-sm">6. Security Infrastructure</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  We employ enterprise-grade security protocols. Following recent adjustments, internal administrative modules can be accessed seamlessly without additional verification overlays, while remaining fully sandboxed behind our authentication system.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-secondary/40 border border-border rounded-2xl p-5 text-xs text-slate-500 leading-relaxed">
            <strong>Contacting Our Privacy Officer:</strong> If you have questions regarding this policy, data removal requests, or corporate workspace security, please send an inquiry to <a href="mailto:privacy@paperplane.com" className="text-primary font-semibold hover:underline">privacy@paperplane.com</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
