import React, { useState, useEffect } from 'react';
import {
    IonContent,
    IonPage,
    IonIcon,
    IonToolbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonButton,
    useIonToast,
    IonModal,
    IonInput
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import CommonHeader from '../../../components/CommonHeader';
import Loader from '../../../components/Loader/Loader';
import { API_BASE_URL } from '../../../services/config';
import {
    createOutline,
    personOutline,
    documentTextOutline,
    walletOutline,
    layersOutline,
    barChartOutline,
    shareSocialOutline,
    settingsOutline,
    peopleOutline,
    swapHorizontalOutline,
    serverOutline,
    pieChartOutline,
    receiptOutline,
    gridOutline,
    keyOutline
} from 'ionicons/icons';
import './UserDetails.css';
import '../../Trade/Trade.css';
import '../../Position/Position.css';

interface UserDetails {
    UserId: number;
    Username: string;
    FirstName: string;
    LastName: string;
    Mobile?: string;
    City?: string;
    Remarks?: string;
    CreatedDate?: string;
    LastLogin?: string;
    IPAddress?: string;
    Credit: number;
    IsActive: boolean;
    // adding placeholder extra fields
    Balance: number;
    Deposit?: number;
    trades?: any[];
    positions?: {
        positions: any[];
        summary: any;
    };
    Exchanges?: string;
    margin_squareoff?: number;
    lock_timing?: number;
    UserExchanges?: any[];
}

const UserDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
    const [user, setUser] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('overview');
    const [present] = useIonToast();

    const [showCreditModal, setShowCreditModal] = useState(false);
    const [creditAmount, setCreditAmount] = useState('');
    const [creditLogs, setCreditLogs] = useState<any[]>([]);

    const [showDepositModal, setShowDepositModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [depositLogs, setDepositLogs] = useState<any[]>([]);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showMarginModal, setShowMarginModal] = useState(false);
    const [marginAmount, setMarginAmount] = useState('100.0');

    const [showLockModal, setShowLockModal] = useState(false);
    const [lockTiming, setLockTiming] = useState('0');

    const [showBrkModal, setShowBrkModal] = useState(false);
    const [brkType, setBrkType] = useState('Lot'); // Turnover or Lot
    const [brkAmount, setBrkAmount] = useState('');
    const [exchanges, setExchanges] = useState<any[]>([]);
    const [selectedExchangeId, setSelectedExchangeId] = useState<number | null>(null);
    const [scripts, setScripts] = useState<any[]>([]);
    const [brokerageSettings, setBrokerageSettings] = useState<any[]>([]);
    const [selectedScripts, setSelectedScripts] = useState<string[]>([]);

    useEffect(() => {
        if (id) {
            fetchUserDetails();
            fetchExchanges();
            fetchBrokerageSettings();
        }
    }, [id]);

    const fetchExchanges = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/User/exchanges/master-data`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setExchanges(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch exchanges', error);
        }
    };

    const fetchBrokerageSettings = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/User/${id}/brokerage-settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setBrokerageSettings(data);
            }
        } catch (error) {
            console.error('Failed to fetch brokerage settings', error);
        }
    };

    const fetchCreditLogs = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/User/${id}/credit-logs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCreditLogs(data);
            }
        } catch (error) {
            console.error('Failed to fetch credit logs', error);
        }
    };

    const fetchDepositLogs = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/User/${id}/deposit-logs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setDepositLogs(data);
            }
        } catch (error) {
            console.error('Failed to fetch deposit logs', error);
        }
    };

    const handleExchangeChange = (e: any) => {
        const exchId = Number(e.detail.value);
        setSelectedExchangeId(exchId);
        setSelectedScripts([]); // Clear selected scripts

        const exchange = exchanges.find(ex => ex.id === exchId);
        if (exchange) {
            const allScripts: any[] = [];
            exchange.groups.forEach((group: any) => {
                group.settings.forEach((setting: any) => {
                    if (!allScripts.find(s => s.symbol === setting.symbol)) {
                        allScripts.push(setting);
                    }
                });
            });
            setScripts(allScripts);
        } else {
            setScripts([]);
        }
    };

    const getBrokerageForScript = (symbol: string) => {
        const setting = brokerageSettings.find(s => s.symbol === symbol && s.exchange_id === selectedExchangeId);
        return setting ? setting.brokerage_amount : '0.00';
    };

    const toggleScriptSelection = (symbol: string) => {
        setSelectedScripts(prev =>
            prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
        );
    };

    const selectAllScripts = (e: any) => {
        if (e.detail.checked) {
            setSelectedScripts(scripts.map(s => s.symbol));
        } else {
            setSelectedScripts([]);
        }
    };

    const handleApplyBrokerage = () => {
        // Just purely locally apply it? We should probably just trigger the save API to be sure.
        handleUpdateBrokerage();
    };

    const handleUpdateBrokerage = async () => {
        if (!selectedExchangeId) {
            present({ message: 'Select an exchange first', duration: 2000, color: 'danger' });
            return;
        }
        if (selectedScripts.length === 0) {
            present({ message: 'Select at least one script', duration: 2000, color: 'danger' });
            return;
        }
        if (!brkAmount || isNaN(Number(brkAmount))) {
            present({ message: 'Enter a valid amount', duration: 2000, color: 'danger' });
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/User/${id}/brokerage-settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    exchange_id: selectedExchangeId,
                    symbols: selectedScripts,
                    brokerage_type: brkType,
                    brokerage_amount: Number(brkAmount)
                })
            });

            if (response.ok) {
                present('Brokerage settings updated successfully', 2000);
                setBrkAmount('');
                setSelectedScripts([]);
                fetchBrokerageSettings(); // Refresh table view
            } else {
                present('Failed to update brokerage settings', 2000);
            }
        } catch (error) {
            console.error('Error updating brokerage settings', error);
        }
    };

    const fetchUserDetails = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/User/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Usually user comes inside an object like { user: {...}, ... } or directly
                const userData = data.user || data;
                console.log(userData);
                setUser({
                    ...userData,
                    Balance: 0 // Default placeholder
                });
                if (userData.margin_squareoff !== undefined && userData.margin_squareoff !== null) {
                    setMarginAmount(userData.margin_squareoff);
                }
                if (userData.lock_timing !== undefined && userData.lock_timing !== null) {
                    setLockTiming(userData.lock_timing.toString());
                }
            } else {
                present('Failed to fetch user details', 2000);
                history.goBack();
            }
        } catch (error) {
            console.error(error);
            present('Network error', 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCredit = async () => {
        if (!creditAmount || isNaN(Number(creditAmount))) {
            present({ message: 'Please enter a valid amount', duration: 2000, color: 'danger' });
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/User/${id}/credit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: Number(creditAmount),
                    remarks: 'Credit added by admin'
                })
            });

            if (response.ok) {
                present('Credit updated successfully', 2000);
                setShowCreditModal(false);
                setCreditAmount('');
                fetchUserDetails(); // Refresh
            } else {
                const errData = await response.json();
                present(errData.message || 'Failed to update credit', 2000);
            }
        } catch (error) {
            console.error(error);
            present('Error occurred', 2000);
        }
    };

    const handleUpdateDeposit = async () => {
        if (!depositAmount || isNaN(Number(depositAmount))) {
            present({ message: 'Please enter a valid amount', duration: 2000, color: 'danger' });
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/User/${id}/deposit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: Number(depositAmount),
                    remarks: 'Deposit added by admin'
                })
            });

            if (response.ok) {
                present('Deposit updated successfully', 2000);
                setShowDepositModal(false);
                setDepositAmount('');
                fetchUserDetails(); // Refresh
            } else {
                const errData = await response.json();
                present(errData.message || 'Failed to update deposit', 2000);
            }
        } catch (error) {
            console.error(error);
            present('Error occurred', 2000);
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            present({ message: 'Password must be at least 6 characters', duration: 2000, color: 'warning' });
            return;
        }
        if (newPassword !== confirmPassword) {
            present({ message: 'Passwords do not match', duration: 2000, color: 'danger' });
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/User/${id}/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    new_password: newPassword,
                    confirm_password: confirmPassword
                })
            });

            if (response.ok) {
                present({ message: 'Password updated successfully', duration: 2000, color: 'success' });
                setShowPasswordModal(false);
                setNewPassword('');
                setConfirmPassword('');
            } else {
                const errData = await response.json();
                present({ message: errData.message || 'Failed to update password', duration: 2000, color: 'danger' });
            }
        } catch (error) {
            console.error(error);
            present({ message: 'Error occurred', duration: 2000, color: 'danger' });
        }
    };

    const handleUpdateMarginSquareoff = async () => {
        if (!marginAmount || isNaN(Number(marginAmount))) {
            present({ message: 'Please enter a valid percentage', duration: 2000, color: 'danger' });
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/User/${id}/margin-squareoff`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    margin_squareoff: Number(marginAmount)
                })
            });

            if (response.ok) {
                present({ message: 'Margin Square-off updated successfully', duration: 2000, color: 'success' });
                setShowMarginModal(false);
                fetchUserDetails(); // Refresh
            } else {
                const errData = await response.json();
                present({ message: errData.message || 'Failed to update Margin Square-off', duration: 2000, color: 'danger' });
            }
        } catch (error) {
            console.error(error);
            present({ message: 'Error occurred', duration: 2000, color: 'danger' });
        }
    };

    const handleUpdateLockTiming = async () => {
        if (lockTiming === '' || isNaN(Number(lockTiming))) {
            present({ message: 'Please enter a valid time in seconds', duration: 2000, color: 'danger' });
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/User/${id}/lock-timing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    lock_timing: Number(lockTiming)
                })
            });

            if (response.ok) {
                present({ message: 'Lock timing updated successfully', duration: 2000, color: 'success' });
                setShowLockModal(false);
                fetchUserDetails(); // Refresh
            } else {
                const errData = await response.json();
                present({ message: errData.message || 'Failed to update lock timing', duration: 2000, color: 'danger' });
            }
        } catch (error) {
            console.error(error);
            present({ message: 'Error occurred', duration: 2000, color: 'danger' });
        }
    };

    if (loading) {
        return (
            <IonPage>
                <CommonHeader title="User Details" backLink="back()" />
                <IonContent><Loader /></IonContent>
            </IonPage>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <IonPage className="user-details-page">
            <CommonHeader title="User Details" backLink="back()" />

            <IonToolbar className="segment-toolbar">
                <IonSegment
                    value={selectedTab}
                    onIonChange={(e) => setSelectedTab(e.detail.value as string)}
                    mode="md"
                >
                    <IonSegmentButton value="overview">
                        <IonLabel>Overview</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="tradelist">
                        <IonLabel>Tradelist</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="position">
                        <IonLabel>Position</IonLabel>
                    </IonSegmentButton>
                </IonSegment>
            </IonToolbar>

            <IonContent className="ion-padding details-content">
                {selectedTab === 'overview' && (
                    <div className="overview-tab">
                        {/* User Profile Card */}
                        <div className="section-card">
                            <div className="section-header gradient-header">
                                <IonIcon icon={personOutline} />
                                <h3>User Profile</h3>
                            </div>
                            <div className="profile-content">
                                <div className="profile-main">
                                    <div className="avatar-circle">
                                        {user.FirstName ? user.FirstName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="profile-info">
                                        <h2>{user.Username}</h2>
                                        <p className="balance-text">
                                            <IonIcon icon={walletOutline} className="red-icon" />
                                            <span className="red-text">Balance: {user.Balance}</span>
                                        </p>
                                        <p className="credit-text">
                                            <IonIcon icon={documentTextOutline} className="green-icon" />
                                            <span className="green-text">Credit: {user?.Credit}</span>
                                        </p>
                                        <p className="credit-text">
                                            <IonIcon icon={layersOutline} className="green-icon" />
                                            <span className="green-text">Deposit: {user?.Deposit}</span>
                                        </p>
                                    </div>
                                </div>
                                {/* <IonButton fill="outline" color="dark" size="small" className="edit-btn">
                                    <IonIcon icon={createOutline} slot="start" />
                                    Edit
                                </IonButton> */}
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="section-card">
                            <div className="section-header gradient-header info">
                                <IonIcon icon={documentTextOutline} />
                                <h3>Personal Information</h3>
                            </div>
                            <div className="info-list">
                                <div className="info-row">
                                    <span className="label">User Name</span>
                                    <span className="value bold">{user.Username}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Name</span>
                                    <span className="value bold">{user.FirstName} {user.LastName}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Remarks</span>
                                    <span className="value">{user.Remarks || '-'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Create Date</span>
                                    <span className="value bold">{user.CreatedDate ? new Date(user.CreatedDate).toLocaleDateString() : '-'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Last Login</span>
                                    <span className="value">{user.LastLogin || '-'}</span>
                                </div>
                                {/* <div className="info-row">
                                    <span className="label">Exchange</span>
                                    <span className="value bold">{user.Exchanges || '-'}</span>
                                </div> */}
                            </div>
                        </div>

                        {/* Action Grid */}
                        <div className="action-grid">
                            <div className="action-item" onClick={() => {
                                setShowCreditModal(true);
                                fetchCreditLogs();
                            }}>
                                <div className="icon-wrapper blue">
                                    <IonIcon icon={walletOutline} />
                                </div>
                                <span>Add Credit</span>
                            </div>

                            <div className="action-item" onClick={() => {
                                setShowDepositModal(true);
                                fetchDepositLogs();
                            }}>
                                <div className="icon-wrapper green">
                                    <IonIcon icon={layersOutline} />
                                </div>
                                <span>Add Deposit</span>
                            </div>

                            {/* <div className="action-item">
                                <div className="icon-wrapper green">
                                    <IonIcon icon={peopleOutline} />
                                </div>
                                <span>Group Quantity Settings</span>
                            </div> */}

                            <div className="action-item" onClick={() => setShowMarginModal(true)}>
                                <div className="icon-wrapper red">
                                    <IonIcon icon={gridOutline} />
                                </div>
                                <span>Margin Square-off Settings</span>
                                <small>{user.margin_squareoff !== undefined ? Number(user.margin_squareoff).toFixed(1) : '100.0'}%</small>
                            </div>

                            <div className="action-item" onClick={() => setShowBrkModal(true)}>
                                <div className="icon-wrapper purple">
                                    <IonIcon icon={settingsOutline} />
                                </div>
                                <span>Brk Setting</span>
                            </div>

                            <div className="action-item" onClick={() => setShowPasswordModal(true)}>
                                <div className="icon-wrapper orange">
                                    <IonIcon icon={keyOutline} />
                                </div>
                                <span>Change Password</span>
                            </div>

                            <div className="action-item" onClick={() => history.push(`/app/reports/generate-bill?userId=${user.UserId}`)}>
                                <div className="icon-wrapper teal">
                                    <IonIcon icon={receiptOutline} />
                                </div>
                                <span>Generate Bill</span>
                            </div>

                            <div className="action-item" onClick={() => setShowLockModal(true)}>
                                <div className="icon-wrapper indigo">
                                    <IonIcon icon={serverOutline} />
                                </div>
                                <span>Lock Timing</span>
                                <small>{user.lock_timing || 0} Sec</small>
                            </div>

                            {/* <div className="action-item">
                                <div className="icon-wrapper orange">
                                    <IonIcon icon={receiptOutline} />
                                </div>
                                <span>Script Quantity Setting</span>
                            </div>

                            <div className="action-item">
                                <div className="icon-wrapper indigo">
                                    <IonIcon icon={swapHorizontalOutline} />
                                </div>
                                <span>Intraday SquareOff</span>
                            </div>

                            <div className="action-item">
                                <div className="icon-wrapper teal">
                                    <IonIcon icon={barChartOutline} />
                                </div>
                                <span>Trade Margin Setting</span>
                            </div>

                            <div className="action-item">
                                <div className="icon-wrapper green-light">
                                    <IonIcon icon={shareSocialOutline} />
                                </div>
                                <span>Sharing Details</span>
                            </div> */}
                        </div>
                    </div>
                )}

                {selectedTab === 'tradelist' && (
                    <div className="trade-list">
                        {user.trades && user.trades.length > 0 ? (
                            user.trades.map((trade: any, idx) => (
                                <div key={idx} className="trade-card">
                                    <div className="card-row top">
                                        <span className="symbol-name">{trade.name || trade.symbol}</span>
                                        <span className={`price-val ${(trade.action || '').toLowerCase()}`}>
                                            {Number(trade.price).toFixed(1)}
                                        </span>
                                    </div>
                                    <div className="card-row middle">
                                        <div className="action-qty">
                                            <span className={`action-badge ${(trade.action || '').toLowerCase() == 'buy' ? 'high' : 'low'}`}>{trade.action.toUpperCase()}</span>
                                            <div className="qty-info">
                                                <IonIcon icon={walletOutline} />
                                                <span>{Number(trade.quantity).toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <span className="trade-timestamp">{new Date(trade.order_time || trade.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="card-row bottom">
                                        <div className="user-info">
                                            <IonIcon icon={personOutline} />
                                            <span>{user.Username}</span>
                                        </div>
                                        <div className="duration-info">
                                            <span>{trade.status || 'Success'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="placeholder-tab">
                                <p>No trades found.</p>
                            </div>
                        )}
                    </div>
                )}

                {selectedTab === 'position' && (
                    <div className="position-list">
                        {user.positions && user.positions.positions && user.positions.positions.length > 0 ? (
                            user.positions.positions.map((pos: any, idx) => (
                                <div key={idx} className="position-item">
                                    <div className="pos-top">
                                        <span className="pos-symbol">{pos.name || pos.symbol}</span>
                                    </div>
                                    <div className="pos-middle">
                                        <span className={`pos-action ${(pos.action || '').toLowerCase()}`}>{(pos.action || '').toUpperCase()}</span>
                                        <div className="pos-qty">
                                            <IonIcon icon={walletOutline} />
                                            <span>{pos.quantity || 0}</span>
                                        </div>
                                    </div>
                                    <div className="pos-bottom">
                                        <div className="atp-cmp">
                                            <span className="label">ATP</span>
                                            <span className="atp-val">{(Number(pos.atp) || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="placeholder-tab">
                                <p>No positions found.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Modals */}
                {/* Add Credit Modal */}
                <IonModal isOpen={showCreditModal} onDidDismiss={() => setShowCreditModal(false)} initialBreakpoint={0.7} breakpoints={[0, 0.7, 1]} className="action-modal">
                    <IonContent className="ion-padding">
                        <div className="modal-inner">
                            <h3>Add Credit</h3>
                            <p className="subtitle">Update credit limit for {user.Username}</p>

                            <div className="input-group">
                                <label>Credit Amount</label>
                                <IonInput
                                    type="number"
                                    value={creditAmount}
                                    onIonChange={e => setCreditAmount(e.detail.value!)}
                                    placeholder="Enter Amount"
                                    className="custom-input"
                                />
                            </div>

                            <IonButton expand="block" onClick={handleUpdateCredit} style={{ '--border-radius': '8px', marginTop: '20px' }}>
                                Save Credit
                            </IonButton>

                            {/* Credit Logs Section */}
                            <div style={{ marginTop: '30px' }}>
                                <h4>Recent Credit Logs</h4>
                                {creditLogs.length > 0 ? (
                                    <div className="brk-table" style={{ fontSize: '12px' }}>
                                        <div className="brk-table-header" style={{ gridTemplateColumns: '1fr 1fr 1fr', padding: '8px' }}>
                                            <span>Date</span>
                                            <span>Amt</span>
                                            <span>By</span>
                                        </div>
                                        <div className="brk-table-body">
                                            {creditLogs.map((log: any) => (
                                                <div key={log.id} className="brk-table-row" style={{ gridTemplateColumns: '1fr 1fr 1fr', padding: '8px' }}>
                                                    <span>{new Date(log.date).toLocaleDateString()}</span>
                                                    <span style={{ color: log.amount >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>{log.amount}</span>
                                                    <span>{log.added_by_username}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ color: '#888', fontSize: '13px' }}>No credit logs found.</p>
                                )}
                            </div>
                        </div>
                    </IonContent>
                </IonModal>

                {/* Add Deposit Modal */}
                <IonModal isOpen={showDepositModal} onDidDismiss={() => setShowDepositModal(false)} initialBreakpoint={0.7} breakpoints={[0, 0.7, 1]} className="action-modal">
                    <IonContent className="ion-padding">
                        <div className="modal-inner">
                            <h3>Add Deposit</h3>
                            <p className="subtitle">Update deposit limit for {user.Username}</p>

                            <div className="input-group">
                                <label>Deposit Amount</label>
                                <IonInput
                                    type="number"
                                    value={depositAmount}
                                    onIonChange={e => setDepositAmount(e.detail.value!)}
                                    placeholder="Enter Amount"
                                    className="custom-input"
                                />
                            </div>

                            <IonButton expand="block" onClick={handleUpdateDeposit} style={{ '--border-radius': '8px', marginTop: '20px' }}>
                                Save Deposit
                            </IonButton>

                            {/* Deposit Logs Section */}
                            <div style={{ marginTop: '30px' }}>
                                <h4>Recent Deposit Logs</h4>
                                {depositLogs.length > 0 ? (
                                    <div className="brk-table" style={{ fontSize: '12px' }}>
                                        <div className="brk-table-header" style={{ gridTemplateColumns: '1fr 1fr 1fr', padding: '8px' }}>
                                            <span>Date</span>
                                            <span>Amt</span>
                                            <span>By</span>
                                        </div>
                                        <div className="brk-table-body">
                                            {depositLogs.map((log: any) => (
                                                <div key={log.id} className="brk-table-row" style={{ gridTemplateColumns: '1fr 1fr 1fr', padding: '8px' }}>
                                                    <span>{new Date(log.date).toLocaleDateString()}</span>
                                                    <span style={{ color: log.amount >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>{log.amount}</span>
                                                    <span>{log.added_by_username}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ color: '#888', fontSize: '13px' }}>No deposit logs found.</p>
                                )}
                            </div>
                        </div>
                    </IonContent>
                </IonModal>

                {/* Change Password Modal */}
                <IonModal isOpen={showPasswordModal} onDidDismiss={() => setShowPasswordModal(false)} initialBreakpoint={0.6} breakpoints={[0, 0.6, 1]} className="action-modal">
                    <IonContent className="ion-padding">
                        <div className="modal-inner">
                            <h3>Change Password</h3>
                            <p className="subtitle">Update password for {user.Username}</p>

                            <div className="input-group">
                                <label>New Password</label>
                                <IonInput
                                    type="password"
                                    value={newPassword}
                                    onIonChange={e => setNewPassword(e.detail.value!)}
                                    placeholder="Enter New Password"
                                    className="custom-input"
                                />
                            </div>

                            <div className="input-group" style={{ marginTop: '15px' }}>
                                <label>Confirm Password</label>
                                <IonInput
                                    type="password"
                                    value={confirmPassword}
                                    onIonChange={e => setConfirmPassword(e.detail.value!)}
                                    placeholder="Confirm New Password"
                                    className="custom-input"
                                />
                            </div>

                            <IonButton expand="block" onClick={handleChangePassword} style={{ '--border-radius': '8px', marginTop: '20px' }} color="primary">
                                Save Password
                            </IonButton>
                        </div>
                    </IonContent>
                </IonModal>

                {/* Margin Square-off Modal */}
                <IonModal isOpen={showMarginModal} onDidDismiss={() => setShowMarginModal(false)} initialBreakpoint={0.6} breakpoints={[0, 0.6, 1]} className="action-modal">
                    <IonContent className="ion-padding">
                        <div className="modal-inner">
                            <h3>Margin Square Off Percentage</h3>

                            <div className="input-group" style={{ marginTop: '20px' }}>
                                <label>Enter Percentage</label>
                                <IonInput
                                    type="number"
                                    value={marginAmount}
                                    onIonChange={e => setMarginAmount(e.detail.value!)}
                                    placeholder="Please enter Cash Margin"
                                    className="custom-input"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                                <IonButton expand="block" fill="outline" onClick={() => setShowMarginModal(false)} style={{ flex: 1, '--border-radius': '8px', color: '#1a202c', '--border-color': '#1a202c' }}>
                                    Cancel
                                </IonButton>
                                <IonButton expand="block" onClick={handleUpdateMarginSquareoff} style={{ flex: 1, '--border-radius': '8px', '--background': '#072146' }}>
                                    Submit
                                </IonButton>
                            </div>
                        </div>
                    </IonContent>
                </IonModal>

                {/* Lock Timing Modal */}
                <IonModal isOpen={showLockModal} onDidDismiss={() => setShowLockModal(false)} initialBreakpoint={0.6} breakpoints={[0, 0.6, 1]} className="action-modal">
                    <IonContent className="ion-padding">
                        <div className="modal-inner">
                            <h3>Profit Lock Timing</h3>
                            <p className="subtitle">Set lock timing (in seconds) for {user.Username}</p>

                            <div className="input-group" style={{ marginTop: '20px' }}>
                                <label>Enter Seconds</label>
                                <IonInput
                                    type="number"
                                    value={lockTiming}
                                    onIonChange={e => setLockTiming(e.detail.value!)}
                                    placeholder="Enter lock timing in seconds"
                                    className="custom-input"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                                <IonButton expand="block" fill="outline" onClick={() => setShowLockModal(false)} style={{ flex: 1, '--border-radius': '8px', color: '#1a202c', '--border-color': '#1a202c' }}>
                                    Cancel
                                </IonButton>
                                <IonButton expand="block" onClick={handleUpdateLockTiming} style={{ flex: 1, '--border-radius': '8px', '--background': '#072146' }}>
                                    Submit
                                </IonButton>
                            </div>
                        </div>
                    </IonContent>
                </IonModal>

                {/* BRK Setting Modal */}
                <IonModal isOpen={showBrkModal} onDidDismiss={() => setShowBrkModal(false)}>
                    <CommonHeader title="Brk Setting" backLink="none" onBack={() => setShowBrkModal(false)} />

                    <IonContent className="ion-padding details-content">
                        <div className="brk-modal-container">
                            {/* Tabs Row */}
                            <div className="brk-tabs-row">
                                <button className={`brk-tab ${brkType === 'Lot' ? 'active' : ''}`} onClick={() => setBrkType('Lot')}>
                                    LOT WISE
                                </button>
                                <button className={`brk-tab ${brkType === 'Turnover' ? 'active' : ''}`} onClick={() => setBrkType('Turnover')}>
                                    TURNOVER WISE
                                </button>
                            </div>

                            {/* Filters Row */}
                            <div className="brk-filters-row">
                                <select className="brk-select" value={selectedExchangeId || ''} onChange={(e) => handleExchangeChange({ detail: { value: e.target.value } })}>
                                    <option value="" disabled>Select Exchange</option>
                                    {exchanges.filter(ex => {
                                        const userEx = user?.UserExchanges?.find((ue: any) => ue.exchange_id === ex.id || ue.exchange_type === ex.name);
                                        if (!userEx || !userEx.is_enabled) return false;
                                        if (brkType === 'Lot' && userEx.lot) return true;
                                        if (brkType === 'Turnover' && userEx.turnover) return true;
                                        return false;
                                    }).map(ex => (
                                        <option key={ex.id} value={ex.id}>{ex.name}</option>
                                    ))}
                                </select>
                                <button className="brk-btn-clear" onClick={() => { setSelectedExchangeId(null); setScripts([]); setSelectedScripts([]); }}>Clear</button>
                            </div>

                            <div className="brk-filters-row">
                                <input
                                    type="number"
                                    placeholder={brkType === 'Lot' ? "Amount (e.g., 400, 500)" : "Percent % (e.g., 0.02, 0.2)"}
                                    className="brk-input"
                                    value={brkAmount}
                                    onChange={e => setBrkAmount(e.target.value)}
                                />
                                <button className="brk-btn-apply" onClick={handleApplyBrokerage} style={{ width: '100px' }}>Apply</button>
                            </div>

                            {/* Scripts Table */}
                            {scripts.length > 0 && (
                                <div className="brk-table">
                                    <div className="brk-table-header">
                                        <input type="checkbox" onChange={selectAllScripts} checked={selectedScripts.length === scripts.length && scripts.length > 0} />
                                        <span>Script Name</span>
                                        <span>Brk</span>
                                    </div>
                                    <div className="brk-table-body">
                                        {scripts.map((script, idx) => (
                                            <div key={idx} className="brk-table-row">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedScripts.includes(script.symbol)}
                                                    onChange={() => toggleScriptSelection(script.symbol)}
                                                />
                                                <span className="brk-script-name">{script.symbol}</span>
                                                <span className="brk-amount">{getBrokerageForScript(script.symbol)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {scripts.length === 0 && selectedExchangeId && (
                                <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>No scripts found for this exchange.</p>
                            )}
                        </div>
                    </IonContent>
                </IonModal>

            </IonContent>
        </IonPage >
    );
};

export default UserDetailsPage;
