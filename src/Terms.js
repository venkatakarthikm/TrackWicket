import Navbar from './Navbar';
import { FileText, Scale, AlertCircle, BookOpen, ShieldAlert, Globe, Ban, RefreshCw } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-10 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Scale className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Terms & Conditions
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              By accessing or using Track Wicket, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Effective from: <span className="font-semibold text-foreground">December 3, 2025</span>
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Important Notice */}
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 animate-fade-in-up">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-foreground mb-2">Important: Educational Project Notice</h3>
                  <p className="text-sm text-muted-foreground">
                    Track Wicket is an <strong>educational and demonstration project</strong>. It is <strong>not intended for commercial use</strong>. 
                    All cricket data, statistics, scores, and related information displayed on this platform are sourced from publicly available 
                    third-party APIs and data providers. <strong>We do not own, claim ownership of, or have any affiliation with</strong> any cricket 
                    boards, teams, leagues, or governing bodies including but not limited to ICC, BCCI, ECB, CA, or any other cricket organization.
                    This project is solely for learning web development concepts.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1 */}
            <section className="bg-card border border-border rounded-xl p-6 md:p-8 card-hover animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  By accessing, browsing, or using the Track Wicket website and services, you acknowledge that you have read, 
                  understood, and agree to be bound by these Terms and Conditions, as well as our Privacy Policy.
                </p>
                <p>
                  If you do not agree to these terms, please do not use our services. Your continued use of the platform 
                  constitutes your acceptance of these terms and any updates or modifications made to them.
                </p>
                <p>
                  These terms apply to all visitors, users, and others who access or use the service, regardless of how they access 
                  the platform (desktop, mobile, or any other device).
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="bg-card border border-border rounded-xl p-6 md:p-8 card-hover animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">2. Educational Purpose & Fair Use</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Track Wicket is created and maintained purely for <strong>educational and non-commercial purposes</strong>. 
                  The platform serves as a demonstration of:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Modern web development technologies (React, Tailwind CSS, etc.)</li>
                  <li>Real-time data fetching and API integration</li>
                  <li>Responsive design principles</li>
                  <li>State management and component architecture</li>
                  <li>Progressive Web App (PWA) features</li>
                </ul>
                <p>
                  All cricket-related data displayed on this platform is obtained from publicly available sources and APIs. 
                  We believe our use of this data falls under fair use for educational purposes. However, if any data owner 
                  has concerns, please contact us and we will promptly address the issue.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-card border border-border rounded-xl p-6 md:p-8 card-hover animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Ban className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">3. Prohibited Uses</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>You agree not to use Track Wicket for any of the following purposes:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Commercial Exploitation:</strong> Using our services or data for any commercial purpose without explicit permission.</li>
                  <li><strong>Data Scraping:</strong> Automated collection, mining, or extraction of data from our platform.</li>
                  <li><strong>Unauthorized Access:</strong> Attempting to gain unauthorized access to our systems, servers, or databases.</li>
                  <li><strong>Service Disruption:</strong> Any activity that disrupts, interferes with, or damages our services or servers.</li>
                  <li><strong>Malicious Activities:</strong> Transmitting viruses, malware, or any code of a destructive nature.</li>
                  <li><strong>Illegal Activities:</strong> Using our platform for any purpose that violates local, state, national, or international law.</li>
                  <li><strong>Gambling:</strong> Using our data or services for betting, gambling, or any related activities.</li>
                  <li><strong>Impersonation:</strong> Misrepresenting your identity or affiliation with any person or organization.</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section className="bg-card border border-border rounded-xl p-6 md:p-8 card-hover animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">4. Third-Party Content & Links</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Track Wicket may display content from or link to third-party websites and services. We want to make clear that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All cricket data (scores, statistics, player information) is sourced from third-party APIs and data providers.</li>
                  <li>Team logos, player images, and other cricket-related imagery belong to their respective copyright holders.</li>
                  <li>We do not control and are not responsible for the content, privacy policies, or practices of any third-party websites or services.</li>
                  <li>Links to external sites are provided for convenience and do not signify endorsement.</li>
                </ul>
                <p className="text-sm italic">
                  All trademarks, service marks, trade names, and logos appearing on this site are the property of their respective owners.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="bg-card border border-border rounded-xl p-6 md:p-8 card-hover animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ShieldAlert className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">5. Disclaimer of Warranties</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Track Wicket is provided on an <strong>"AS IS" and "AS AVAILABLE"</strong> basis without any warranties of any kind, 
                  either express or implied, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Accuracy:</strong> We do not guarantee the accuracy, completeness, or timeliness of any information displayed.</li>
                  <li><strong>Availability:</strong> We do not guarantee uninterrupted or error-free access to our services.</li>
                  <li><strong>Data Reliability:</strong> Cricket scores and statistics are fetched from third-party sources and may contain errors or delays.</li>
                  <li><strong>Fitness for Purpose:</strong> We make no warranty that our services will meet your specific requirements.</li>
                  <li><strong>Security:</strong> While we implement security measures, we cannot guarantee absolute protection against all threats.</li>
                </ul>
                <p className="font-semibold text-foreground">
                  Do not rely solely on information from this platform for any important decisions, especially those involving financial matters like betting or gambling.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="bg-card border border-border rounded-xl p-6 md:p-8 card-hover animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Scale className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">6. Limitation of Liability</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  To the maximum extent permitted by applicable law, Track Wicket and its creators, contributors, 
                  and affiliates shall not be liable for any:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Direct, indirect, incidental, special, consequential, or punitive damages</li>
                  <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
                  <li>Damages resulting from unauthorized access to or use of our servers</li>
                  <li>Damages resulting from any interruption or cessation of transmission to or from our services</li>
                  <li>Damages resulting from any bugs, viruses, or similar issues transmitted through our services</li>
                  <li>Any errors or omissions in any content displayed on the platform</li>
                </ul>
                <p>
                  This limitation applies regardless of the legal theory on which such damages may be based, even if 
                  we have been advised of the possibility of such damages.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="bg-card border border-border rounded-xl p-6 md:p-8 card-hover animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <RefreshCw className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">7. Modifications to Terms</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We reserve the right to modify, update, or replace these Terms and Conditions at any time at our sole discretion. 
                  Changes will be effective immediately upon posting on this page.
                </p>
                <p>
                  We will update the "Effective from" date at the top of these Terms when changes are made. Your continued use 
                  of the platform after any changes constitutes your acceptance of the new Terms.
                </p>
                <p>
                  We encourage you to periodically review these Terms to stay informed of any updates. If you disagree with 
                  any changes, you should discontinue use of our services.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section className="bg-card border border-border rounded-xl p-6 md:p-8 card-hover animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">8. Governing Law & Contact</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  These Terms shall be governed by and construed in accordance with applicable laws, without regard to 
                  conflict of law principles.
                </p>
                <p>
                  If you have any questions about these Terms, or if you believe any content on this platform infringes 
                  on your rights, please contact us through our GitHub repository. We take all concerns seriously and 
                  will respond promptly to address any issues.
                </p>
                <p className="text-sm italic">
                  By using Track Wicket, you acknowledge that you have read, understood, and agree to be bound by these 
                  Terms and Conditions.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Terms;
