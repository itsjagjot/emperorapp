import React, { useState, useEffect } from 'react';
import {
    IonContent, IonPage, IonSearchbar, IonGrid, IonRow, IonCol, IonIcon
} from '@ionic/react';
import { searchOutline, refreshOutline, swapVerticalOutline } from 'ionicons/icons';
import CommonHeader from '../../../../components/CommonHeader';
import Loader from '../../../../components/Loader/Loader';
import './WeeklyAdmin.css';
import UserFilter from '../../../../components/UserFilter';
import TradeService from '../../../../services/TradeService';

const WeeklyAdmin: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<{
        users: any[],
        summary: { realised: number, m2m: number, brokerage: number, total: number }
    }>({
        users: [],
        summary: { realised: 0, m2m: 0, brokerage: 0, total: 0 }
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const resp = await TradeService.getPnLSummary({ username: selectedUser });
            if (resp && resp.users) {
                setData(resp);
            }
        } catch (error) {
            console.error('Failed to fetch PnL summary', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedUser]);

    const formatVal = (val: number) => {
        return Number(val || 0).toFixed(2);
    };

    const getValColorClass = (val: number) => {
        return val >= 0 ? 'theme-green2-text' : 'theme-red-text';
    };

    const filteredUsers = data.users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <IonPage>
            <CommonHeader title="Weekly Admin" />
            <IonContent className="admin-bg">
                {loading && <Loader overlay />}

                {/* 1. Correct Header Filters (User Filter + Action Icons) */}
                <div className="admin-filter-container">
                    <div className="dropdown-flex-grow custom-input-box compact">
                        <UserFilter
                            onUserChange={setSelectedUser}
                            includeSelf
                            label="Select User"
                        />
                    </div>

                    <div className="icon-actions-group">
                        <div className="action-circle-btn search-bg" onClick={fetchData}>
                            <IonIcon icon={searchOutline} />
                        </div>
                        <div className="action-circle-btn reset-outline-btn" onClick={() => { setSelectedUser('all'); setSearchTerm(''); }}>
                            <IonIcon icon={refreshOutline} />
                        </div>
                    </div>
                </div>

                {/* 2. Custom Searchbar */}
                <div className="search-wrapper">
                    <IonSearchbar
                        value={searchTerm}
                        onIonInput={e => setSearchTerm(e.detail.value!)}
                        placeholder="Search by name"
                        className="wa-custom-search"
                        mode="ios"
                    />
                </div>

                {/* 3. Dark Summary Card - Premium Look */}
                <div className="summary-card-premium">
                    <div className="summary-header">
                        <span className="summary-title">Total Summary</span>
                    </div>

                    <div className="summary-body">
                        <div className="summary-item">
                            <span className="summary-label">Total P&L</span>
                            <span className={`summary-value ${data.summary.total >= 0 ? 'green-text' : 'red-text'}`}>
                                {formatVal(data.summary.total)}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Realized PL</span>
                            <span className={`summary-value ${data.summary.realised >= 0 ? 'green-text' : 'red-text'}`}>
                                {formatVal(data.summary.realised)}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">M2M PL</span>
                            <span className={`summary-value ${data.summary.m2m >= 0 ? 'green-text' : 'red-text'}`}>
                                {formatVal(data.summary.m2m)}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Brk</span>
                            <span className={`summary-value ${data.summary.brokerage >= 0 ? 'green-text' : 'red-text'}`}>
                                {formatVal(data.summary.brokerage)}
                            </span>
                        </div>
                        <div className="summary-item last-item">
                            <span className="summary-label">Admin Profit</span>
                            <span className={`summary-value ${data.summary.total >= 0 ? 'green-text' : 'red-text'}`}>
                                {/* Logic for admin profit? currently same as total */}
                                {formatVal(data.summary.total)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. Sort Pills */}
                {/* <div className="sort-section-compact">
                    <span className="sort-hint">Sort by:</span>
                    <div className="sort-pill-green active">Total P&L <IonIcon icon={swapVerticalOutline} /></div>
                    <div className="sort-pill-green">Admin Profit <IonIcon icon={swapVerticalOutline} /></div>
                </div> */}

                {/* 5. User Detail Cards */}
                {filteredUsers.map((user, idx) => (
                    <div className="user-report-card-premium" key={idx}>
                        <div className="user-header-flex">
                            <div className="user-avatar-green">{user.username.charAt(0).toUpperCase()}</div>
                            <div className="user-text-meta">
                                <span className="id-txt">{user.username}</span>
                                <span className="sub-id-txt">Parent: {user.parent || 'System'}</span>
                            </div>
                        </div>

                        <IonGrid className="stats-grid">
                            <IonRow>
                                <IonCol size="6">
                                    <label className="stats-label">Realised P&L</label>
                                    <div className={getValColorClass(user.realised)}>{formatVal(user.realised)}</div>
                                </IonCol>
                                <IonCol size="6">
                                    <label className="stats-label">Brokerage</label>
                                    <div className={getValColorClass(user.brokerage)}>{formatVal(user.brokerage)}</div>
                                </IonCol>
                            </IonRow>
                            <IonRow className="ion-margin-top">
                                <IonCol size="6">
                                    <label className="stats-label">M2M P&L</label>
                                    <div className={getValColorClass(user.m2m)}>{formatVal(user.m2m)}</div>
                                </IonCol>
                                <IonCol size="6">
                                    <label className="stats-label">Admin Brokerage</label>
                                    <div className="theme-green2-text">0.00</div> {/* Placeholder */}
                                </IonCol>
                            </IonRow>
                        </IonGrid>

                        <div className="footer-stats-strip">
                            <div className="f-item">
                                <label>Total P&L</label>
                                <span className={getValColorClass(user.total)}>{formatVal(user.total)}</span>
                            </div>
                            <div className="f-item">
                                <label>Admin Profit</label>
                                <span className={getValColorClass(user.total)}>{formatVal(user.total)}</span> {/* Placeholder */}
                            </div>
                            <div className="f-item">
                                <label>Total Admin</label>
                                <span className={getValColorClass(user.total)}>{formatVal(user.total)}</span> {/* Placeholder */}
                            </div>
                        </div>
                    </div>
                ))}

            </IonContent>
        </IonPage>
    );
};

export default WeeklyAdmin;