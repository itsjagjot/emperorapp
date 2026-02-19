import React, { useState, useEffect } from 'react';
import {
    IonContent, IonPage, IonIcon, IonSelect,
    IonSelectOption, IonDatetime, IonModal, IonSpinner
} from '@ionic/react';
import {
    timeOutline, locationOutline, desktopOutline,
    searchOutline, fingerPrintOutline, calendarOutline, chevronBackOutline,
    refreshOutline
} from 'ionicons/icons';
import './LoginHistory.css';
import CommonHeader from '../../../components/CommonHeader';
import DateFilter from '../../../components/DateFilter';
import CommonSearch from '../../../components/CommonSearch';
import { getLoginHistory } from '../../../services/authService';

interface HistoryItem {
    LoginTime: string;
    IpAddress: string;
    UserAgent: string;
    Status: string;
    FailureReason: string | null;
}

const LoginHistory: React.FC = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [dates, setDates] = useState<{ start: string | null, end: string | null }>({ start: null, end: null });

    const fetchHistory = async (startDate: string | null = dates.start, endDate: string | null = dates.end) => {
        setLoading(true);
        try {
            const response = await getLoginHistory(1, 40, startDate || undefined, endDate || undefined);
            if (response.success) {
                setHistory(response.data.Data || []);
            }
        } catch (error) {
            console.error('Failed to fetch login history', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (start: string | null, end: string | null) => {
        setDates({ start, end });
        fetchHistory(start, end);
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const filteredHistory = history.filter(item =>
        item.IpAddress.toLowerCase().includes(searchText.toLowerCase()) ||
        item.Status.toLowerCase().includes(searchText.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const parseUserAgent = (ua: string) => {
        if (!ua || ua === 'N/A') return 'Unknown Device';

        // Simple regex for common OS/Devices
        if (ua.includes('Android')) return 'Android Device';
        if (ua.includes('iPhone')) return 'iPhone';
        if (ua.includes('iPad')) return 'iPad';
        if (ua.includes('Windows')) return 'Windows PC';
        if (ua.includes('Macintosh')) return 'Macbook';
        if (ua.includes('Linux')) return 'Linux PC';

        return 'Web Browser';
    };

    return (
        <IonPage className="login-history-page">
            <CommonHeader title="Login History" />

            <IonContent className="premium-bg ion-padding">

                {/* 1. Modern Time Period Selector */}
                <div className="mb-12">
                    <DateFilter onDateChange={handleDateChange} />
                </div>

                <div className="action-row-compact mb-12">
                    {/* 4. Grey Search Bar */}
                    <CommonSearch
                        value={searchText}
                        onChange={setSearchText}
                        placeholder="Search by IP or status..."
                    />
                    {/* View/Search Icon Button */}
                    <div className="filter-box" onClick={() => fetchHistory()}>
                        <IonIcon icon={searchOutline} />
                    </div>

                    {/* Clear/Reset Icon Button */}
                    <div className="reset-icon-box" onClick={() => setSearchText('')}>
                        <IonIcon icon={refreshOutline} />
                    </div>
                </div>

                {/* 4. History List */}
                <div className="history-timeline">
                    {loading ? (
                        <div className="ion-text-center ion-padding">
                            <IonSpinner name="crescent" />
                        </div>
                    ) : filteredHistory.length > 0 ? (
                        filteredHistory.map((item, i) => (
                            <div className={`history-premium-card ${item.Status === 'Success' ? 'card-success' : 'card-failed'}`} key={i}>
                                <div className="card-header">
                                    <div className="user-profile">
                                        <div className={`avatar-circle ${item.Status === 'Success' ? '' : 'avatar-failed'}`}>
                                            {item.Status === 'Success' ? '✓' : '✕'}
                                        </div>
                                        <div className="user-name-info">
                                            <h4>{parseUserAgent(item.UserAgent)}</h4>
                                            <span className="ip-text">
                                                {formatDate(item.LoginTime)}
                                                {/* • {formatTime(item.LoginTime)} */}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={item.Status === 'Success' ? 'status-pill-success' : 'status-pill-failed'}>
                                        {item.Status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="card-detail-strip">
                                    <div className="detail-chip">
                                        <IonIcon icon={locationOutline} />
                                        <span>{item.IpAddress}</span>
                                    </div>
                                    <div className="detail-chip">
                                        <IonIcon icon={timeOutline} />
                                        <span>{formatTime(item.LoginTime)}</span>
                                    </div>
                                    <div className="detail-chip">
                                        <IonIcon icon={desktopOutline} />
                                        <span>{parseUserAgent(item.UserAgent).split(' ')[0]}</span>
                                    </div>
                                </div>

                                {item.FailureReason && (
                                    <div className="failure-reason-box">
                                        <IonIcon icon={fingerPrintOutline} />
                                        <span>{item.FailureReason}</span>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="ion-text-center ion-padding">
                            <p>No login history found.</p>
                        </div>
                    )}
                </div>

            </IonContent>
        </IonPage>
    );
};

export default LoginHistory;
