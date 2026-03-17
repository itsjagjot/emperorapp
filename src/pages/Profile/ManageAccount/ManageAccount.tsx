import React, { useState, useEffect } from 'react';
import {
    IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton, IonTitle, IonIcon, IonList, IonItem, IonLabel, IonBadge, IonAvatar, useIonRouter, IonButton
} from '@ionic/react';
import { addOutline, trashOutline, chevronForwardOutline, swapHorizontalOutline } from 'ionicons/icons';
import './ManageAccount.css';
import CommonHeader from '../../../components/CommonHeader';

const ManageAccount: React.FC = () => {
    const router = useIonRouter();
    const [accounts, setAccounts] = useState<any[]>([]);
    const [activeUserId, setActiveUserId] = useState<number | null>(null);

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = () => {
        const storedAccounts = localStorage.getItem('multi_accounts');
        const activeUserStr = localStorage.getItem('user');

        if (storedAccounts) {
            setAccounts(JSON.parse(storedAccounts));
        }

        if (activeUserStr) {
            const activeUser = JSON.parse(activeUserStr);
            setActiveUserId(activeUser.UserId || activeUser.user_id);
        }
    };

    const handleSwitchAccount = (account: any) => {
        if ((account.user.UserId || account.user.user_id) === activeUserId) return;

        // Set flag to prevent apiInterceptor from clearing data during switch
        sessionStorage.setItem('account_switching', 'true');

        // Switch logic - update active user storage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('accessToken', account.token);
        localStorage.setItem('user', JSON.stringify(account.user));

        // Refresh app state to new user context
        window.location.href = '/app/quotes';
    };

    const handleRemoveAccount = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        const updated = [...accounts];
        const removed = updated.splice(index, 1)[0];
        setAccounts(updated);
        localStorage.setItem('multi_accounts', JSON.stringify(updated));

        // If the removed account was the active one
        if ((removed.user.UserId || removed.user.user_id) === activeUserId) {
            if (updated.length > 0) {
                // Switch to first available account
                const nextAccount = updated[0];
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('accessToken', nextAccount.token);
                localStorage.setItem('user', JSON.stringify(nextAccount.user));
                window.location.href = '/app/quotes';
            } else {
                // No more accounts, go to login
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                localStorage.removeItem('multi_accounts');
                window.location.href = '/login';
            }
        }
    };

    const handleLogoutAll = () => {
        localStorage.removeItem('multi_accounts');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('menuUnlocked');
        localStorage.removeItem('all_market_timings');
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <IonPage>
            <CommonHeader title='Manage Account' />

            <IonContent className="manage-bg">
                <div className="manage-account-container">
                    {accounts.length === 0 ? (
                        <div className="empty-accounts">
                            <div className="empty-icon">👤</div>
                            <p className="empty-text">No accounts added yet</p>
                            <p className="empty-subtext">Login from the main page or add a new account</p>
                        </div>
                    ) : (
                        <>
                            <p className="account-count-label">{accounts.length} Account{accounts.length > 1 ? 's' : ''} Logged In</p>
                            <div className="account-list-wrapper">
                                {accounts.map((acc, index) => {
                                    const isActive = (acc.user.UserId || acc.user.user_id) === activeUserId;
                                    const displayName = (acc.user.FirstName + ' ' + (acc.user.LastName || '')).trim() || acc.user.Username;

                                    return (
                                        <div
                                            key={index}
                                            className={`account-card ${isActive ? 'active' : ''}`}
                                            onClick={() => handleSwitchAccount(acc)}
                                        >
                                            <div className="card-left">
                                                <div className="account-circle">
                                                    <img src="/assets/logo_icon.png" alt="E" />
                                                </div>
                                                <div className="account-info">
                                                    <h2 className="acc-username">{acc.user.Username}</h2>
                                                    <p className="acc-fullname">{displayName}</p>
                                                </div>
                                            </div>

                                            <div className="card-right">
                                                {isActive ? (
                                                    <span className="status-badge">Active</span>
                                                ) : (
                                                    <div className="card-actions">
                                                        {/* <button
                                                            className="switch-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSwitchAccount(acc);
                                                            }}
                                                        >
                                                            <IonIcon icon={swapHorizontalOutline} />
                                                        </button> */}
                                                        <button
                                                            className="remove-btn"
                                                            onClick={(e) => handleRemoveAccount(e, index)}
                                                        >
                                                            <IonIcon icon={trashOutline} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    <div className="manage-footer">
                        <button
                            className="add-account-btn"
                            onClick={() => router.push('/app/profile/manage-account/add')}
                        >
                            <IonIcon icon={addOutline} />
                            <span>Add Another Account</span>
                        </button>
                        {accounts.length > 0 && (
                            <button className="logout-all-btn" onClick={handleLogoutAll}>
                                Logout All Accounts
                            </button>
                        )}
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default ManageAccount;

