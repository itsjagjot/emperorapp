import React from 'react';
import { IonContent, IonPage, IonIcon, IonText } from '@ionic/react';
import { chevronBackOutline, shieldCheckmarkOutline, lockClosedOutline, eyeOffOutline, documentTextOutline } from 'ionicons/icons';
import './PrivacyPolicy.css';
import CommonHeader from '../../../../components/CommonHeader';

const PrivacyPolicy: React.FC = () => {
    return (
        <IonPage className="privacy-page">
            <CommonHeader title="Privacy Policy" />

            <IonContent className="premium-bg ion-padding">
                {/* Hero Section */}
                <div className="privacy-hero">
                    <div className="shield-icon-container">
                        <IonIcon icon={shieldCheckmarkOutline} />
                    </div>
                    <h3>Data Protection</h3>
                    <p>Last Updated: Feb 2026</p>
                </div>

                {/* Policy Sections */}
                <div className="policy-container">

                    <div className="policy-section">
                        <div className="section-title">
                            <IonIcon icon={lockClosedOutline} />
                            <h4>Information Security</h4>
                        </div>
                        <div className="policy-card">
                            <p>1. This application is for <strong>Educational purposes only</strong> and does not store personal financial data.</p>
                            <p>2. We use industry-standard encryption to protect your login history and device information.</p>
                        </div>
                    </div>

                    <div className="policy-section">
                        <div className="section-title">
                            <IonIcon icon={eyeOffOutline} />
                            <h4>Data Usage</h4>
                        </div>
                        <div className="policy-card">
                            <p>3. We do not provide tips, news, or any influence-related information to third parties.</p>
                            <p>4. No monetary transactions are involved or tracked within this application.</p>
                        </div>
                    </div>

                    <div className="policy-section">
                        <div className="section-title">
                            <IonIcon icon={documentTextOutline} />
                            <h4>Your Rights</h4>
                        </div>
                        <div className="policy-card">
                            <p>5. Users have the right to request account deletion at any time via the profile settings.</p>
                            <p>6. All activity logs are strictly for user reference and security auditing.</p>
                        </div>
                    </div>

                </div>

                <div className="privacy-footer">
                    <IonText color="medium">
                        By using this app, you agree to our terms.
                    </IonText>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default PrivacyPolicy;