import { LegalPage } from '@/components/legal-page';

export default function PrivacyPage() {
    return (
        <LegalPage
            title="Privacy Policy"
            summary="This policy explains how the Floor Ops Pro beta demonstration handles information while you explore the product."
        >
            <section>
                <h2>Demo information</h2>
                <p>The beta demonstration uses sample flooring-operation data. Routine changes made while exploring the demo are stored in your browser and are not submitted to Floor Ops Pro as customer production records.</p>
            </section>

            <section>
                <h2>Information you choose to provide</h2>
                <p>If you contact us by email, we receive the information included in your message, such as your name, company, email address, and the details you choose to share. We use it to respond, arrange a demonstration, and discuss a potential pilot.</p>
            </section>

            <section>
                <h2>Technical information</h2>
                <p>Our hosting and infrastructure providers may process ordinary request information needed to deliver and protect the site, such as timestamps, browser or device information, requested pages, and network identifiers.</p>
            </section>

            <section>
                <h2>AI features</h2>
                <p>When an AI feature is deliberately used, the prompt and relevant sample project context may be sent to the configured AI service to produce a response. Do not enter confidential, personal, or regulated information into the beta demonstration.</p>
            </section>

            <section>
                <h2>Browser storage</h2>
                <p>The demo uses browser storage to keep the selected role, interface preferences, and temporary sample-data changes available during your session. You can remove that information through your browser&apos;s site-data controls.</p>
            </section>

            <section>
                <h2>Sharing and retention</h2>
                <p>We do not sell information submitted through the beta. Information may be handled by service providers that operate the site or communications systems, and may be retained as reasonably necessary to respond to inquiries, maintain security, or meet legal obligations.</p>
            </section>

            <section>
                <h2>Your choices</h2>
                <p>You may ask us to correct or delete information you sent directly to us by contacting <a href="mailto:hello@floorops.pro">hello@floorops.pro</a>. Availability of particular privacy rights depends on your location and the circumstances.</p>
            </section>
        </LegalPage>
    );
}
