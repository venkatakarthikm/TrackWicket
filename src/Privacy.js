import Navbar from './Navbar';
import { Shield, Eye, Lock, Database, Globe, Mail, AlertTriangle, FileText } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-10 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your privacy is important to us. This Privacy Policy explains how Track Wicket collects, uses, and protects your information when you use our services.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: <span className="font-semibold text-foreground">December 3, 2025</span>
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Important Notice */}
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 animate-fade-in-up">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-foreground mb-2">Educational Purpose Disclaimer</h3>
                  <p className="text-sm text-muted-foreground">
                    Track Wicket is an <strong>educational project</strong> created for learning and demonstration purposes only. 
                    This is <strong>not a commercial service</strong>. All cricket data displayed is sourced from publicly available APIs 
                    and third-party providers. We do not claim ownership of any cricket-related data, statistics, or imagery. 
                    This platform is intended to help users understand web development concepts and real-time data integration.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1 */}
            <section className="bg-card border border-border rounded-xl p-6 md:p-8 card-hover animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">1. Information We Collect</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>We collect information to provide and improve our services. The types of information we may collect include:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Usage Data:</strong> Information about how you interact with our platform, including pages visited, features used, and time spent on the site.</li>
                  <li><strong>Device Information:</strong> Technical data such as browser type, operating system, device type, and screen resolution for optimization purposes.</li>
                  <li><strong>Cookies & Local Storage:</strong> We use browser storage to save your preferences (like theme settings) and improve your experience.</li>
                  <li><strong>Notification Preferences:</strong> If you opt-in for notifications, we store your subscription preferences and team selections.</li>
                  <li><strong>Search Queries:</strong> Search terms you enter are processed locally and not stored on our servers.</li>
                </ul>
                <p className="text-sm italic">
                  Note: We do not collect personally identifiable information (PII) such as names, email addresses, or phone numbers unless you explicitly provide them.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="bg-card border border-border rounded-xl p-6 md:p-8 card-hover animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">2. How We Use Information</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>The information we collect is used for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Service Delivery:</strong> To display live cricket scores, match updates, and player statistics.</li>
                  <li><strong>Personalization:</strong> To remember your preferences such as favorite teams and display settings.</li>
                  <li><strong>Performance Optimization:</strong> To analyze usage patterns and improve site performance and user experience.</li>
                  <li><strong>Notifications:</strong> To send push notifications about matches you've subscribed to (only if you've opted in).</li>
                  <li><strong>Educational Demonstration:</strong> To showcase web development techniques including real-time data fetching, responsive design, and state management.</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-card border border-border rounded-xl p-6 md:p-8 card-hover animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">3. Third-Party Services & Data Sources</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>Track Wicket integrates with various third-party services to provide cricket data:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Cricket Data APIs:</strong> We fetch match scores, player statistics, and tournament information from publicly available cricket APIs. This data belongs to the respective providers.</li>
                  <li><strong>Push Notification Services:</strong> We use third-party notification services to deliver alerts. These services have their own privacy policies.</li>
                  <li><strong>Analytics:</strong> We may use basic analytics tools to understand site usage. No personal data is shared with these services.</li>
                </ul>
                <p className="text-sm italic">
                  We are not affiliated with any official cricket boards, leagues, or governing bodies. All trademarks and data belong to their respective owners.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="bg-card border border-border rounded-xl p-6 md:p-8 card-hover animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">4. Data Security</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>We implement appropriate security measures to protect your information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>HTTPS Encryption:</strong> All data transmitted between your browser and our servers is encrypted using industry-standard TLS/SSL protocols.</li>
                  <li><strong>Local Storage Security:</strong> Preferences stored in your browser are kept locally and not transmitted to external servers.</li>
                  <li><strong>No Password Storage:</strong> As this is an educational project, we do not implement user accounts that require password storage.</li>
                  <li><strong>Regular Updates:</strong> We keep our dependencies and security patches up to date.</li>
                </ul>
                <p className="text-sm">
                  However, please note that no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="bg-card border border-border rounded-xl p-6 md:p-8 card-hover animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">5. Cookies & Tracking</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>We use minimal tracking technologies:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Essential Cookies:</strong> Used to remember your preferences (theme, language) and maintain session state.</li>
                  <li><strong>Local Storage:</strong> Used to cache data for faster loading and store your notification preferences.</li>
                  <li><strong>No Advertising Cookies:</strong> We do not use advertising or marketing cookies.</li>
                  <li><strong>No Cross-Site Tracking:</strong> We do not track your activity across other websites.</li>
                </ul>
                <p>You can clear your browser's cookies and local storage at any time through your browser settings.</p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="bg-card border border-border rounded-xl p-6 md:p-8 card-hover animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">6. Your Rights & Contact</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>You have the following rights regarding your data:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Access:</strong> You can view what data is stored locally in your browser through developer tools.</li>
                  <li><strong>Deletion:</strong> You can clear all locally stored data by clearing your browser's cache and cookies.</li>
                  <li><strong>Opt-Out:</strong> You can disable notifications at any time through your browser settings.</li>
                  <li><strong>Questions:</strong> For any privacy-related questions about this educational project, please open an issue on our GitHub repository.</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section className="bg-card border border-border rounded-xl p-6 md:p-8 card-hover animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">7. Changes to This Policy</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, 
                  legal, or regulatory reasons. We will notify users of any material changes by updating the "Last updated" date at 
                  the top of this policy.
                </p>
                <p>
                  We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
