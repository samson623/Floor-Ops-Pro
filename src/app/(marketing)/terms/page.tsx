import { LegalPage } from '@/components/legal-page';

export default function TermsPage() {
    return (
        <LegalPage
            title="Terms of Use"
            summary="These terms apply to evaluation of the Floor Ops Pro beta demonstration."
        >
            <section>
                <h2>Beta evaluation</h2>
                <p>Floor Ops Pro is currently provided as a demonstration for evaluation and pilot discussions. The demo contains sample data and may change, reset, or become unavailable without notice.</p>
            </section>

            <section>
                <h2>Permitted use</h2>
                <p>You may explore the demo for legitimate business evaluation. You may not attempt to disrupt the service, bypass technical limits, introduce malicious code, scrape it at unreasonable volume, or use it to violate another person&apos;s rights.</p>
            </section>

            <section>
                <h2>No production data</h2>
                <p>Do not enter confidential customer information, payment data, health information, credentials, or other sensitive production data into the beta. A separate written pilot or service agreement is required before using Floor Ops Pro for live operations.</p>
            </section>

            <section>
                <h2>Sample outputs</h2>
                <p>Financial figures, schedules, estimates, AI responses, alerts, and operational recommendations in the demo are illustrative. They should not be treated as accounting, legal, safety, or other professional advice.</p>
            </section>

            <section>
                <h2>Ownership</h2>
                <p>The demo, its interface, branding, software, and supplied content remain the property of Floor Ops Pro or its licensors. These terms do not transfer ownership or grant rights beyond evaluating the beta.</p>
            </section>

            <section>
                <h2>Beta availability and warranty</h2>
                <p>The demonstration is provided on an “as available” basis for evaluation. To the extent permitted by law, no warranty is made that the beta will be uninterrupted, error-free, or suitable for production use.</p>
            </section>

            <section>
                <h2>Future service</h2>
                <p>Pricing, features, implementation scope, data handling, support, and service commitments for a pilot or commercial deployment will be governed by a separate written agreement.</p>
            </section>
        </LegalPage>
    );
}
