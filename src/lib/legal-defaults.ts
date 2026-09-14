import type { LegalPageData, LegalSlug } from "./legal-types";

export const DEFAULT_TERMS_HTML = `
<h2>1. Introduction and Scope of Services</h2>
<p>Welcome to Limex Consultancy Firm (&ldquo;Limex&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). Limex provides corporate secretarial, business formation, regulatory compliance, trade licensing, tax estimation, VAT advisory, and trademark documentation assistance across Bangladesh.</p>
<p>By accessing our website, using our business tools, or retaining our consultancy services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please discontinue use of our site and services immediately.</p>

<h2>2. Nature of Advisory and Relationship</h2>
<p>Limex acts as an independent corporate consultancy and compliance facilitation firm. While our team consists of experienced corporate professionals, chartered accountants, and regulatory advisors:</p>
<ul>
  <li>Information provided on this website, in business tools, calculators, and guides is for general guidance and informational purposes only.</li>
  <li>Use of our online tools or general inquiries does not automatically establish an advocate-client or formal retainer relationship until an engagement is confirmed.</li>
  <li>Statutory matters requiring bespoke formal representation before judicial or regulatory authorities will be handled under a designated engagement scope.</li>
</ul>

<h2>3. Client Responsibilities and Accuracy of Information</h2>
<p>To ensure timely and lawful filings with government bodies including the Registrar of Joint Stock Companies and Firms (RJSC), National Board of Revenue (NBR), City Corporations, and Department of Patents, Designs and Trademarks (DPDT):</p>
<ul>
  <li>You agree to provide true, complete, accurate, and up-to-date information, documentation, identification (NID/Passport), and entity particulars.</li>
  <li>Limex is not liable for delays, penalties, rejection, or revocation arising from erroneous, misleading, fraudulent, or incomplete information supplied by the client.</li>
  <li>You are responsible for safeguarding any client credentials, account portals, and signing authority tokens.</li>
</ul>

<h2>4. Government Fees, Stamp Duties, and Third-Party Costs</h2>
<p>Unless explicitly itemized and agreed in writing as an all-inclusive fixed package:</p>
<ul>
  <li>Statutory government fees, capital-based registration duties, non-judicial stamp paper costs, and municipal levies are determined by the respective government authorities of Bangladesh.</li>
  <li>Statutory fee schedules published on our calculators and guides reflect current official rates but are subject to legislative revision by government bodies without prior notice.</li>
  <li>Limex professional service fees are distinct from government statutory charges.</li>
</ul>

<h2>5. Processing Timelines and Government Discretion</h2>
<p>While Limex adheres to the highest standards of dispatch and turnaround (with guaranteed processing within our operational control):</p>
<ul>
  <li>Final issuance of certificates, licenses, registrations, and official sanctions rests under the statutory authority of the relevant government ministries, departments, and municipalities.</li>
  <li>Operational server outages, government holidays, systemic delays at official portals, or manual inspections by statutory officers may influence final delivery timelines.</li>
</ul>

<h2>6. Confidentiality and Document Custody</h2>
<p>We treat all client business ideas, trade secrets, shareholder structures, and financial records with strict professional confidentiality. Documents submitted to Limex are used exclusively for executing your authorized assignments and statutory compliances.</p>

<h2>7. Limitation of Liability</h2>
<p>To the maximum extent permitted under Bangladesh law, Limex shall not be liable for any indirect, punitive, special, or consequential damages resulting from client non-compliance, regulatory policy modifications, or third-party bank transaction failures. Our cumulative liability in connection with any assignment is limited to the professional fees paid to Limex for that specific service.</p>

<h2>8. Governing Law and Jurisdiction</h2>
<p>These Terms and Conditions shall be governed by and interpreted in accordance with the laws of the People&rsquo;s Republic of Bangladesh. Any dispute arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in Dhaka, Bangladesh.</p>

<h2>9. Contact and Clarifications</h2>
<p>For any questions regarding these Terms and Conditions or to request a formal client engagement agreement, please contact us at <strong>hello@yourbrand.com</strong> or visit our offices in Dhaka, Bangladesh.</p>
`.trim();

export const DEFAULT_PRIVACY_HTML = `
<h2>1. Commitment to Privacy</h2>
<p>Limex Consultancy Firm (&ldquo;Limex&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;) is committed to respecting and protecting the privacy of our clients, prospective business founders, and website visitors. This Privacy Policy explains how we collect, use, store, and protect your personal and corporate information.</p>

<h2>2. Information We Collect</h2>
<p>We collect information that you voluntarily provide when using our website, scheduling consultations, using our calculators and document tools, or retaining our corporate services:</p>
<ul>
  <li><strong>Identity &amp; Contact Details:</strong> Full name, national identity number (NID), passport details, email address, phone/WhatsApp number, and postal address.</li>
  <li><strong>Corporate &amp; Entity Information:</strong> Proposed company names, paid-up capital, business objectives, shareholder and director details, trade license addresses, TIN/BIN data, and organizational structures.</li>
  <li><strong>Inquiry &amp; Communication Records:</strong> Notes from consultation requests, call-back appointments, service inquiries, and customer support exchanges.</li>
  <li><strong>Technical &amp; Usage Data:</strong> Anonymized log files, browser type, operating system, and general access metrics to ensure platform security and optimize service performance.</li>
</ul>

<h2>3. How We Use Your Information</h2>
<p>Your information is processed strictly for legitimate business and compliance purposes:</p>
<ul>
  <li><strong>Executing Regulatory Filings:</strong> Preparing and lodging statutory documentation with RJSC, NBR, City Corporations, DPDT, and other regulatory bodies as authorized by you.</li>
  <li><strong>Service Delivery &amp; Consultations:</strong> Reviewing your service inquiries, responding to call-back requests, and providing accurate legal and tax estimates.</li>
  <li><strong>Compliance &amp; Recordkeeping:</strong> Maintaining audit trails and statutory records required by applicable regulatory standards.</li>
  <li><strong>Platform Security:</strong> Detecting, preventing, and addressing fraud, unauthorized portal access, or technical anomalies.</li>
</ul>

<h2>4. Confidentiality and Third-Party Disclosures</h2>
<p><strong>We never sell, rent, or trade your personal or corporate data to third-party marketers or advertisers.</strong></p>
<p>Information is only shared under the following defined circumstances:</p>
<ul>
  <li><strong>Statutory Authorities:</strong> Regulatory bodies (such as RJSC, NBR, Municipal Corporations) strictly for the purpose of executing the statutory filings you instructed us to perform.</li>
  <li><strong>Authorized Service Providers:</strong> Trusted banking, payment processing, or cloud hosting partners who assist in operating our secure infrastructure and agree to confidentiality obligations.</li>
  <li><strong>Legal Mandate:</strong> Where required by valid court order, summons, or applicable law of Bangladesh.</li>
</ul>

<h2>5. Data Security and Storage</h2>
<p>We implement robust technical and organizational measures to safeguard your information against unauthorized access, disclosure, alteration, or destruction:</p>
<ul>
  <li>Secure socket layer (TLS/HTTPS) encryption across all web interactions.</li>
  <li>Encrypted database storage and restricted administrative access protocols.</li>
  <li>Regular review of information collection, storage, and processing practices.</li>
</ul>

<h2>6. Retention Period</h2>
<p>We retain your personal and business documentation only for as long as necessary to fulfill the purposes for which it was collected, to provide continuous statutory compliance reminders, or as required by Bangladesh commercial and tax legislation.</p>

<h2>7. Your Rights</h2>
<p>You have the right to:</p>
<ul>
  <li>Request access to the personal data we hold about you.</li>
  <li>Request correction of inaccurate or incomplete information.</li>
  <li>Request the deletion of your personal records, subject to statutory retention obligations under Bangladesh law.</li>
  <li>Withdraw consent for optional promotional or newsletter updates at any time.</li>
</ul>

<h2>8. Updates to This Policy</h2>
<p>We may update this Privacy Policy periodically to reflect changes in regulatory requirements or our internal operational practices. The latest revision date will always be visible at the top of this page.</p>

<h2>9. Contact Us Regarding Your Data</h2>
<p>If you have any questions, concerns, or requests regarding this Privacy Policy or how your data is handled, please contact our data compliance desk at <strong>hello@yourbrand.com</strong>.</p>
`.trim();

const BASE_TIMESTAMP = "2026-09-14T00:00:00.000Z";

export const defaultLegalPages: Record<LegalSlug, LegalPageData> = {
  terms: {
    id: "default-terms",
    slug: "terms",
    title: "Terms and Conditions",
    contentHtml: DEFAULT_TERMS_HTML,
    contentJson: null,
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
  },
  privacy: {
    id: "default-privacy",
    slug: "privacy",
    title: "Privacy Policy",
    contentHtml: DEFAULT_PRIVACY_HTML,
    contentJson: null,
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
  },
};
