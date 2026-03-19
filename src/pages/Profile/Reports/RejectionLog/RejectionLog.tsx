import React, { useState, useEffect } from 'react';
import {
    IonContent, IonPage, IonSelect, IonSelectOption, IonSearchbar, IonIcon, IonSpinner
} from '@ionic/react';
import { searchOutline, refreshOutline } from 'ionicons/icons';
import CommonHeader from '../../../../components/CommonHeader';
import DateFilter from '../../../../components/DateFilter';
import './RejectionLog.css';
import UserFilter from '../../../../components/UserFilter';
import { API_BASE_URL, DEFAULT_EXCHANGE } from '../../../../services/config';

interface RejectionLog {
    id: number;
    script_name: string;
    symbol: string;
    username: string;
    qty: number;
    price: number;
    action: string;
    reason: string;
    created_at: string;
    order_time?: string; // fallback
}

const RejectionLogHistory: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [selectedExchange, setSelectedExchange] = useState<string>(DEFAULT_EXCHANGE);
    const [selectedScript, setSelectedScript] = useState<string>('All');
    const [logs, setLogs] = useState<RejectionLog[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [masterData, setMasterData] = useState<any[]>([]);
    const [availableScripts, setAvailableScripts] = useState<string[]>([]);
    const [dates, setDates] = useState<{ start: string | null, end: string | null }>({ start: null, end: null });

    const fetchMasterData = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/User/exchanges/master-data`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            if (response.ok) {
                const res = await response.json();
                if (res.Success) {
                    setMasterData(res.Data);
                }
            }
        } catch (error) {
            console.error('Error fetching master data:', error);
        }
    };

    useEffect(() => {
        fetchMasterData();
    }, []);

    useEffect(() => {
        if (masterData.length > 0) {
            const currentEx = masterData.find(ex => ex.name === selectedExchange);
            if (currentEx) {
                const scripts = new Set<string>();
                currentEx.groups.forEach((group: any) => {
                    group.settings.forEach((s: any) => scripts.add(s.symbol));
                });
                setAvailableScripts(Array.from(scripts));
            } else {
                setAvailableScripts([]);
            }
        }
    }, [selectedExchange, masterData]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const params = new URLSearchParams({
                status: 'Reject',
            });
            if (selectedScript !== 'All') params.append('symbol', selectedScript);
            if (selectedUser) params.append('user_id', selectedUser);
            if (dates.start) params.append('from_date', dates.start);
            if (dates.end) params.append('to_date', dates.end);

            const response = await fetch(`${API_BASE_URL}/${selectedExchange}/orders/rejection-log?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('Error fetching rejection logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (start: string | null, end: string | null) => {
        setDates({ start, end });
        // Initial hit will be through onDateChange if we want
        // But let's trigger it manually to be sure it matches user expectation 'aunde sar'
        fetchLogsInner(start, end, selectedUser);
    };

    // Helper to fetch with explicit params
    const fetchLogsInner = async (start = dates.start, end = dates.end, user = selectedUser) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const urlParams = new URLSearchParams({ status: 'Reject' });
            if (selectedScript !== 'All') urlParams.append('symbol', selectedScript);
            if (user) urlParams.append('user_id', user);
            if (start) urlParams.append('from_date', start);
            if (end) urlParams.append('to_date', end);

            const response = await fetch(`${API_BASE_URL}/${selectedExchange}/orders/rejection-log?${urlParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('Error fetching rejection logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogsInner();
    }, [selectedExchange]);

    const handleReset = () => {
        setSelectedScript('All');
        setSelectedUser(null);
        setSearchQuery('');
        fetchLogsInner(null, null, null);
    };

    const filteredLogs = logs.filter(log =>
        log.script_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (timeStr: string) => {
        if (!timeStr) return 'N/A';
        return new Date(timeStr).toLocaleString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short'
        });
    };

    return (
        <IonPage>
            <CommonHeader title="Rejection Log History" />
            <IonContent className="admin-bg">

                <div className="rejection-wrapper">

                    {/* Row 1: Exchange and Script */}
                    <div className="filter-row">
                        <div className="filter-item-half">
                            <IonSelect
                                value={selectedExchange}
                                onIonChange={e => setSelectedExchange(e.detail.value)}
                                placeholder="Exchange"
                                interface="action-sheet"
                                className="brand-select"
                            >
                                {masterData.map(ex => (
                                    <IonSelectOption key={ex.id} value={ex.name}>{ex.name}</IonSelectOption>
                                ))}
                                {masterData.length === 0 && <IonSelectOption value="MCX">MCX</IonSelectOption>}
                            </IonSelect>
                        </div>
                        <div className="filter-item-half">
                            <IonSelect
                                value={selectedScript}
                                onIonChange={e => setSelectedScript(e.detail.value)}
                                placeholder="All Script"
                                interface="action-sheet"
                                className="brand-select"
                            >
                                <IonSelectOption value="All">All Script</IonSelectOption>
                                {availableScripts.map(script => (
                                    <IonSelectOption key={script} value={script}>{script}</IonSelectOption>
                                ))}
                                {/* {availableScripts.length === 0 && (
                                    <>
                                        <IonSelectOption value="GOLD">GOLD</IonSelectOption>
                                        <IonSelectOption value="SILVER">SILVER</IonSelectOption>
                                    </>
                                )} */}
                            </IonSelect>
                        </div>
                    </div>

                    {/* Row 2: Date Filter (Custom Component) */}
                    <div className="full-width">
                        <DateFilter onDateChange={handleDateChange} />
                    </div>

                    {/* Row 3: All User Select & Buttons */}
                    <div className="filter-row">
                        <div className="dropdown-flex-grow">
                            <UserFilter
                                onUserChange={setSelectedUser}
                                includeSelf
                                label="Select User"
                            />
                        </div>
                        <div className="icon-actions-group">
                            <div className="action-circle-btn search-bg" onClick={fetchLogs}>
                                <IonIcon icon={searchOutline} />
                            </div>
                            <div className="action-circle-btn reset-outline-btn" onClick={handleReset}>
                                <IonIcon icon={refreshOutline} />
                            </div>
                        </div>
                    </div>

                    {/* Row 5: Search Bar */}
                    <IonSearchbar
                        value={searchQuery}
                        onIonInput={e => setSearchQuery(e.detail.value!)}
                        placeholder="Search exchange or script"
                        className="pnl-searchbar"
                    />

                    {/* Table Section - Horizontal Scrollable */}
                    <div className="scrollable-table-container">
                        <div className="table-min-width">
                            <div className="table-header-row">
                                <div className="th-item col-script">Script ↑</div>
                                <div className="th-item col-user">User</div>
                                <div className="th-item col-action">Action</div>
                                <div className="th-item col-qty">Qty</div>
                                <div className="th-item col-price">Price</div>
                                <div className="th-item col-reason">Reason</div>
                                <div className="th-item col-time">Time</div>
                            </div>

                            {loading ? (
                                <div className="loading-state">
                                    <IonSpinner name="crescent" />
                                    <p>Loading records...</p>
                                </div>
                            ) : filteredLogs.length > 0 ? (
                                filteredLogs.map(log => (
                                    <div className="table-data-row" key={log.id}>
                                        <div className="td-item col-script">
                                            <span className="script-name">{log.script_name}</span>
                                        </div>
                                        <div className="td-item col-user">{log.username}</div>
                                        <div className="td-item col-action">
                                            <span className={`type-badge ${log.action === 'Buy' ? 'buy' : 'sell'}`}>
                                                {log.action?.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="td-item col-qty">{log.qty}</div>
                                        <div className="td-item col-price">₹{log.price}</div>
                                        <div className="td-item col-reason">
                                            <span className="reason-text">{log.reason}</span>
                                        </div>
                                        <div className="td-item col-time">{formatTime(log.created_at || log.order_time || '')}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <p>No rejection logs found</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default RejectionLogHistory;