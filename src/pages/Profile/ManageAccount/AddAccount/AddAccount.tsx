import React, { useState, useEffect } from 'react';
import {
    IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonBackButton, IonTitle, IonInput, IonIcon, IonList, IonItem, IonLabel, IonAvatar, useIonRouter
} from '@ionic/react';
import { personOutline, eyeOutline, eyeOffOutline, searchOutline, chevronForwardOutline } from 'ionicons/icons';
import { loginUser, fetchServers } from '../../../../services/authService';
import { useToast } from '../../../../components/Toast/Toast';
import './AddAccount.css';
import CommonHeader from '../../../../components/CommonHeader';

const AddAccount: React.FC = () => {
    const router = useIonRouter();
    const { showToast } = useToast();

    // Server Search States
    const [serverSearch, setServerSearch] = useState<string>('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [selectedServer, setSelectedServer] = useState<any>(null);

    // Form States
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (serverSearch.length >= 2 && !selectedServer) {
                const results = await fetchServers(serverSearch);
                setSuggestions(results);
                setShowSuggestions(results.length > 0);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [serverSearch, selectedServer]);

    const handleSelectServer = (srv: any) => {
        setSelectedServer(srv);
        setServerSearch(srv.name);
        setShowSuggestions(false);
    };

    const handleLogin = async () => {
        if (!selectedServer) {
            showToast('Please select a valid server', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await loginUser(username, password, 'EMPEROR', selectedServer.id);

            if (response.success && response.data) {
                const newAccount = {
                    user: response.data.user,
                    token: response.data.accessToken,
                    serverName: selectedServer.name,
                    serverId: selectedServer.id
                };

                // Store in Multi-accounts
                const storedAccounts = localStorage.getItem('multi_accounts');
                let accountsList = storedAccounts ? JSON.parse(storedAccounts) : [];

                // IMPORTANT: Ensure current active account is in the list first
                // (handles case where user logged in before multi-account feature was added)
                const currentUserStr = localStorage.getItem('user');
                const currentToken = localStorage.getItem('accessToken');
                if (currentUserStr && currentToken) {
                    try {
                        const currentUser = JSON.parse(currentUserStr);
                        const currentUserId = currentUser.UserId || currentUser.user_id;
                        const currentExists = accountsList.some((a: any) =>
                            (a.user.UserId || a.user.user_id) === currentUserId
                        );
                        if (!currentExists) {
                            accountsList.push({
                                user: currentUser,
                                token: currentToken,
                                serverName: '',
                                serverId: null
                            });
                        }
                    } catch (e) {
                        // ignore parse error
                    }
                }

                // Avoid duplication for new account (by user_id)
                const newUserId = newAccount.user.UserId || newAccount.user.user_id;
                const existingIndex = accountsList.findIndex((a: any) => {
                    const aUserId = a.user.UserId || a.user.user_id;
                    return aUserId === newUserId;
                });

                if (existingIndex > -1) {
                    accountsList[existingIndex] = newAccount;
                } else {
                    accountsList.push(newAccount);
                }

                localStorage.setItem('multi_accounts', JSON.stringify(accountsList));

                // Set account switching flag to prevent apiInterceptor from clearing data on 401
                sessionStorage.setItem('account_switching', 'true');

                // Switch to this account now
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('accessToken', newAccount.token);
                localStorage.setItem('user', JSON.stringify(newAccount.user));

                showToast('Account added and switched successfully!', 'success');

                // Delay and go to quotes
                setTimeout(() => {
                    window.location.href = '/app/quotes';
                }, 1000);
            } else {
                showToast(response.message || 'Login failed', 'error');
            }
        } catch (err) {
            showToast('Network error or server unavailable', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getAvatarColor = (name: string) => {
        const colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FFB833', '#33FFF5'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash % colors.length);
        return colors[index];
    };

    return (
        <IonPage>
            <CommonHeader title='Add Account' />

            <IonContent className="admin-bg add-account-page">
                <div className="add-account-container">

                    <div className="input-field-group">
                        <IonItem className="custom-input-item" lines="none">
                            <IonInput
                                value={serverSearch}
                                placeholder="Select Server"
                                onIonInput={e => {
                                    setServerSearch(e.detail.value!);
                                    if (selectedServer) setSelectedServer(null);
                                }}
                                className="custom-input-field"
                            />
                        </IonItem>

                        {showSuggestions && (
                            <div className="server-suggestions">
                                <IonList className="suggestion-inner-list" lines="full">
                                    {suggestions.map((srv) => (
                                        <IonItem
                                            key={srv.id}
                                            button
                                            detail={false}
                                            onClick={() => handleSelectServer(srv)}
                                            className="suggestion-row"
                                        >
                                            <IonAvatar slot="start" className="srv-sm-avatar"
                                                style={{ backgroundColor: getAvatarColor(srv.name) }}>
                                                {srv.name.charAt(0).toUpperCase()}
                                            </IonAvatar>
                                            <IonLabel className="srv-sm-text">{srv.name}</IonLabel>
                                            <IonIcon icon={chevronForwardOutline} slot="end" className="srv-sm-arrow" />
                                        </IonItem>
                                    ))}
                                </IonList>
                            </div>
                        )}
                    </div>

                    <div className="input-field-group">
                        <IonItem className="custom-input-item" lines="none">
                            <IonInput
                                value={username}
                                placeholder="Username"
                                onIonInput={e => setUsername(e.detail.value!)}
                                className="custom-input-field"
                            />
                        </IonItem>
                    </div>

                    <div className="input-field-group">
                        <IonItem className="custom-input-item" lines="none">
                            <IonInput
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                placeholder="Password"
                                onIonInput={e => setPassword(e.detail.value!)}
                                className="custom-input-field"
                            />
                            <IonIcon
                                icon={showPassword ? eyeOffOutline : eyeOutline}
                                slot="end"
                                className="pw-toggle-icon"
                                onClick={() => setShowPassword(!showPassword)}
                            />
                        </IonItem>
                    </div>

                    <div className="add-acc-action">
                        <button
                            className="btn-add-login"
                            onClick={handleLogin}
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default AddAccount;
