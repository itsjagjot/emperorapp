import React, { useState, useEffect } from 'react';
import {
    IonContent, IonPage, IonSelect, IonSelectOption, IonSearchbar, IonIcon, IonSpinner
} from '@ionic/react';
import { searchOutline, refreshOutline } from 'ionicons/icons';
import CommonHeader from '../../../../components/CommonHeader';
import DateFilter from '../../../../components/DateFilter';
import './DeleteTrade.css';
import UserFilter from '../../../../components/UserFilter';
import { API_BASE_URL, DEFAULT_EXCHANGE } from '../../../../services/config';

interface DeletedTrade {
    id: number;
    name: string;
    username: string;
    quantity: number;
    price: number;
    status: string;
    canceled_by: string;
    order_time: string;
}

const DeleteTrade: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [selectedExchange, setSelectedExchange] = useState<string>(DEFAULT_EXCHANGE);
    const [selectedScript, setSelectedScript] = useState<string>('All');
    const [trades, setTrades] = useState<DeletedTrade[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [masterData, setMasterData] = useState<any[]>([]);
    const [availableScripts, setAvailableScripts] = useState<string[]>([]);

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

    const fetchTrades = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const params = new URLSearchParams({
                status: 'Cancelled',
            });
            if (selectedScript !== 'All') params.append('symbol', selectedScript);
            if (selectedUser) params.append('user_id', selectedUser);

            const response = await fetch(`${API_BASE_URL}/${selectedExchange}/orders?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTrades(data);
            }
        } catch (error) {
            console.error('Error fetching deleted trades:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrades();
    }, [selectedExchange]);

    const handleReset = () => {
        setSelectedScript('All');
        setSelectedUser(null);
        setSearchQuery('');
        fetchTrades();
    };

    const filteredTrades = trades.filter(trade =>
        trade.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (timeStr: string) => {
        return new Date(timeStr).toLocaleString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short'
        });
    };

    return (
        <IonPage>
            <CommonHeader title="Delete Trades" />
            <IonContent className="admin-bg">

                <div className="delete-trades-wrapper">

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
                                placeholder="Select Script"
                                interface="action-sheet"
                                className="brand-select"
                            >
                                <IonSelectOption value="All">All Script</IonSelectOption>
                                {availableScripts.map(script => (
                                    <IonSelectOption key={script} value={script}>{script}</IonSelectOption>
                                ))}
                                {availableScripts.length === 0 && (
                                    <>
                                        <IonSelectOption value="GOLD">GOLD</IonSelectOption>
                                        <IonSelectOption value="SILVER">SILVER</IonSelectOption>
                                    </>
                                )}
                            </IonSelect>
                        </div>
                    </div>

                    {/* Row 2: Date Filter (Custom Component) */}
                    <div className="full-width">
                        <DateFilter />
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
                            <div className="action-circle-btn search-bg" onClick={fetchTrades}>
                                <IonIcon icon={searchOutline} />
                            </div>
                            <div className="action-circle-btn reset-outline-btn" onClick={handleReset}>
                                <IonIcon icon={refreshOutline} />
                            </div>
                        </div>
                    </div>

                    {/* Row 5: Search Bar */}
                    <div className="search-container">
                        <IonSearchbar
                            value={searchQuery}
                            onIonInput={e => setSearchQuery(e.detail.value!)}
                            placeholder="Search exchange or script"
                            className="pnl-searchbar"
                        />
                    </div>

                    {/* Table Section */}
                    <div className="scrollable-table-container">
                        <div className="table-min-width">
                            <div className="table-header-row">
                                <div className="th-item desc-col">Script ↑</div>
                                <div className="th-item">User</div>
                                <div className="th-item">Qty</div>
                                <div className="th-item">Price</div>
                                <div className="th-item">Status</div>
                                <div className="th-item">Time</div>
                            </div>

                            {loading ? (
                                <div className="loading-state">
                                    <IonSpinner name="crescent" />
                                    <p>Loading records...</p>
                                </div>
                            ) : filteredTrades.length > 0 ? (
                                filteredTrades.map(trade => (
                                    <div className="table-data-row" key={trade.id}>
                                        <div className="td-item desc-col">
                                            <span className="script-name">{trade.name}</span>
                                        </div>
                                        <div className="td-item">{trade.username}</div>
                                        <div className="td-item">{trade.quantity}</div>
                                        <div className="td-item">₹{trade.price}</div>
                                        <div className="td-item">
                                            <div className="status-info">
                                                <span className="status-text">{trade.status}</span>
                                                {/* {trade.canceled_by && <span className="by-text">By: {trade.canceled_by}</span>} */}
                                            </div>
                                        </div>
                                        <div className="td-item">{formatTime(trade.order_time)}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <p>No trades found</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default DeleteTrade;