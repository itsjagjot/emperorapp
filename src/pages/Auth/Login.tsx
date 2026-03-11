import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, IonInput, IonIcon, IonList, IonItem, IonLabel, IonAvatar } from '@ionic/react';
import { personOutline, eyeOutline, searchOutline, chevronForwardOutline, swapHorizontalOutline, trashOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { loginUser, fetchServers } from '../../services/authService';
import './Login.css';

const Login: React.FC = () => {
    // Server Search States
    const [serverSearch, setServerSearch] = useState<string>('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [selectedServer, setSelectedServer] = useState<any>(null);

    // Form States
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [savedAccounts, setSavedAccounts] = useState<any[]>([]);
    const history = useHistory();

    // Load saved accounts from multi_accounts
    useEffect(() => {
        const stored = localStorage.getItem('multi_accounts');
        if (stored) {
            try {
                setSavedAccounts(JSON.parse(stored));
            } catch (e) {
                setSavedAccounts([]);
            }
        }
    }, []);

    const handleQuickSwitch = (account: any) => {
        sessionStorage.setItem('account_switching', 'true');
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('accessToken', account.token);
        localStorage.setItem('user', JSON.stringify(account.user));
        history.push('/app/quotes');
        window.location.reload();
    };

    const handleRemoveAccount = (e: React.MouseEvent, index: number) => {
        e.stopPropagation(); // Prevent handleQuickSwitch from firing
        const updatedAccounts = [...savedAccounts];
        updatedAccounts.splice(index, 1);
        setSavedAccounts(updatedAccounts);
        localStorage.setItem('multi_accounts', JSON.stringify(updatedAccounts));
    };

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (serverSearch.length >= 3 && !selectedServer) {
                const results = await fetchServers(serverSearch);
                setSuggestions(results);
                setShowSuggestions(results.length > 0);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [serverSearch, selectedServer]);

    const handleSelectServer = (srv: any) => {
        setSelectedServer(srv);
        setServerSearch(srv.name); // Set input text to selected server name
        setShowSuggestions(false);
    };

    const handleLogin = async () => {
        if (!selectedServer) {
            setError('Please select a valid server from the list');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await loginUser(username, password, 'EMPEROR', selectedServer.id);

            if (response.success && response.data) {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                // Save to multi_accounts list for multi-account management
                const newAccount = {
                    user: response.data.user,
                    token: response.data.accessToken,
                    serverName: selectedServer.name,
                    serverId: selectedServer.id
                };

                const storedAccounts = localStorage.getItem('multi_accounts');
                let accountsList = storedAccounts ? JSON.parse(storedAccounts) : [];

                // Avoid duplication
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

                // Set flag to prevent apiInterceptor interference during transition
                sessionStorage.setItem('account_switching', 'true');

                setLoading(false);
                history.push('/app/quotes');
                window.location.reload();
            } else {
                setError(response.message || 'Login failed');
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError('Network error or server unavailable');
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
            <IonContent scrollY={true} className="oryx-login-page">
                <div className="wrapper">
                    <main className="content">
                        {error && (
                            <div className="error-container">
                                <div className="error-bubble">{error}</div>
                                <div className="error-arrow"></div>
                            </div>
                        )}

                        <div className="logo-section">
                            <img src="/logo.png" alt="ORYX" className="main-logo" />
                        </div>

                        <h1 className="login-heading">Login</h1>

                        <div className="form-area">
                            {/* Server Search Group */}
                            <div className="input-group">
                                <label className="floating-label">Select Server</label>
                                <div className={`input-box ${showSuggestions ? 'no-bottom-radius' : ''}`}>
                                    <IonInput
                                        value={serverSearch}
                                        placeholder="Search Company or Server"
                                        onIonInput={e => {
                                            setServerSearch(e.detail.value!);
                                            if (selectedServer) setSelectedServer(null);
                                        }}
                                        className="input-field"
                                    />
                                    <IonIcon icon={searchOutline} className="red-icon" />
                                </div>

                                {/* Floating Suggestion List */}
                                {showSuggestions && (
                                    <div className="suggestion-container">
                                        <IonList className="suggestion-list">
                                            {suggestions.map((srv) => (
                                                <IonItem
                                                    key={srv.id}
                                                    button
                                                    detail={false}
                                                    onClick={() => handleSelectServer(srv)}
                                                    className="suggestion-item"
                                                >
                                                    <IonAvatar slot="start" className="srv-avatar-letter"
                                                        style={{ backgroundColor: getAvatarColor(srv.name) }}>
                                                        {srv.name.charAt(0).toUpperCase()}
                                                    </IonAvatar>
                                                    <IonLabel className="srv-text">{srv.name}</IonLabel>
                                                    <IonIcon icon={chevronForwardOutline} slot="end" className="srv-arrow" />
                                                </IonItem>
                                            ))}
                                        </IonList>
                                    </div>
                                )}
                            </div>

                            {/* Username */}
                            <div className="input-group">
                                <label className="floating-label">Username</label>
                                <div className="input-box">
                                    <IonInput
                                        value={username}
                                        onIonInput={e => setUsername(e.detail.value!)}
                                        className="input-field"
                                    />
                                    <IonIcon icon={personOutline} className="red-icon" />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="input-group">
                                <label className="floating-label">Password</label>
                                <div className="input-box">
                                    <IonInput
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onIonInput={e => setPassword(e.detail.value!)}
                                        className="input-field"
                                    />
                                    <IonIcon
                                        icon={eyeOutline}
                                        className="red-icon"
                                        onClick={() => setShowPassword(!showPassword)}
                                    />
                                </div>
                            </div>

                            <button
                                className="btn-login"
                                onClick={handleLogin}
                                disabled={loading}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>

                            <div className="links-row">
                                <span>Register</span>
                                <span>Forgot Password</span>
                            </div>

                            {/* Saved Accounts Quick Switch */}
                            {savedAccounts.length > 0 && (
                                <div className="saved-accounts-section">
                                    <p className="saved-accounts-label">Switch to Saved Account</p>
                                    <div className="saved-accounts-list">
                                        {savedAccounts.map((acc, idx) => {
                                            const displayName = (acc.user.FirstName + ' ' + (acc.user.LastName || '')).trim() || acc.user.Username;
                                            return (
                                                <div
                                                    key={idx}
                                                    className="saved-account-card"
                                                    onClick={() => handleQuickSwitch(acc)}
                                                >
                                                    <div className="saved-acc-avatar">
                                                        <img src="/assets/logo_icon.png" alt="E" />
                                                    </div>
                                                    <div className="saved-acc-info">
                                                        <span className="saved-acc-name">{acc.user.Username}</span>
                                                        {acc.serverName && (
                                                            <span className="saved-acc-server">{acc.serverName}</span>
                                                        )}
                                                    </div>
                                                    <div className="saved-acc-actions">
                                                        {/* <IonIcon icon={swapHorizontalOutline} className="saved-acc-arrow" /> */}
                                                        <IonIcon
                                                            icon={trashOutline}
                                                            className="saved-acc-delete"
                                                            onClick={(e) => handleRemoveAccount(e, idx)}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                    <footer className="footer-version">Version 1.0.0</footer>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Login;