import React, { useState } from 'react';
import {
    IonContent,
    IonPage,
    IonIcon,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
} from '@ionic/react';
import { lockClosed, eyeOutline, eyeOffOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import CommonHeader from '../../../components/CommonHeader';
import './ChangePassword.css';

const ChangePassword: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <IonPage className="change-password-page">
            <CommonHeader title="Change Password" />
            <IonContent className="ion-padding premium-bg">

                <div className="password-header">
                    <div className="icon-circle-main">
                        <IonIcon icon={shieldCheckmarkOutline} />
                    </div>
                    <h2>Secure Your Account</h2>
                    <p>Enter your current password and choose a strong new one.</p>
                </div>

                <div className="form-container">
                    {/* Current Password */}
                    <div className="custom-input-group">
                        <label>Current Password</label>
                        <div className="input-wrapper">
                            <IonIcon icon={lockClosed} className="input-icon-start" />
                            <IonInput
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter current password"
                            />
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="custom-input-group">
                        <label>New Password</label>
                        <div className="input-wrapper">
                            <IonIcon icon={lockClosed} className="input-icon-start" />
                            <IonInput
                                type={showPassword ? 'text' : 'password'}
                                placeholder="At least 8 characters"
                            />
                            <IonIcon
                                icon={showPassword ? eyeOffOutline : eyeOutline}
                                className="input-icon-end"
                                onClick={() => setShowPassword(!showPassword)}
                            />
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="custom-input-group">
                        <label>Confirm New Password</label>
                        <div className="input-wrapper">
                            <IonIcon icon={lockClosed} className="input-icon-start" />
                            <IonInput
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Re-type new password"
                            />
                        </div>
                    </div>

                    <div className="password-hints">
                        <p>● Minimum 8 characters</p>
                        <p>● Include a special character (@, #, $)</p>
                    </div>
                </div>

                <div className="action-footer">
                    <IonButton expand="block" className="premium-submit-btn">
                        Update Password
                    </IonButton>
                </div>

            </IonContent>
        </IonPage>
    );
};

export default ChangePassword;