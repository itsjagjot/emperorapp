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
import { changePassword } from '../../../services/authService';
import { useToast } from '../../../components/Toast/Toast';
import './ChangePassword.css';

const ChangePassword: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast('Please fill all fields', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showToast('New password must be at least 6 characters', 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await changePassword({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword
            });

            if (response.success) {
                showToast('Password updated successfully', 'success');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                showToast(response.message || 'Failed to update password', 'error');
            }
        } catch (error) {
            showToast('An error occurred. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <IonPage className="change-password-page">
            <CommonHeader title="Change Password" />
            <IonContent className="ion-padding premium-bg">

                <div className="password-header">
                    <div className="icon-circle-main">
                        <IonIcon icon={shieldCheckmarkOutline} />
                    </div>
                    <h2>Secure Your Account</h2>
                    <div className="password-hints">
                        <p>Enter your current password and choose a strong new one.</p>
                        <p>● Minimum 6 characters</p>
                        <p>● Include a special character (@, #, $, %, !, ^, *, ?)</p>
                    </div>
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
                                value={currentPassword}
                                onIonInput={e => setCurrentPassword(e.detail.value!)}
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
                                placeholder="At least 6 characters"
                                value={newPassword}
                                onIonInput={e => setNewPassword(e.detail.value!)}
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
                                value={confirmPassword}
                                onIonInput={e => setConfirmPassword(e.detail.value!)}
                            />
                        </div>
                    </div>
                </div>

                <div className="action-footer">
                    <IonButton
                        expand="block"
                        className="premium-submit-btn"
                        onClick={handleUpdatePassword}
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </IonButton>
                </div>

            </IonContent>
        </IonPage>
    );
};

export default ChangePassword;