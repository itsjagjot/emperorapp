import React, { useState, useEffect } from 'react';
import {
    IonContent, IonPage, IonIcon, IonRefresher, IonRefresherContent
} from '@ionic/react';
import { searchOutline, refreshOutline, personOutline, timeOutline } from 'ionicons/icons';
import CommonHeader from '../../../components/CommonHeader';
import Loader from '../../../components/Loader/Loader';
import './AccountSummary.css';
import DateFilter from '../../../components/DateFilter';
import CommonSearch from '../../../components/CommonSearch';
import UserFilter from '../../../components/UserFilter';
import TradeService from '../../../services/TradeService';
import { format } from 'date-fns';

interface LedgerItem {
    id: string;
    name: string;
    symbol: string;
    username: string;
    type: 'Brokerage' | 'Profit/Loss';
    amount: number;
    timestamp: string;
    details: {
        action?: string;
        price?: number;
        entry_price?: number;
        exit_price?: number;
        quantity: number;
        lot_size: number;
        brokerage_percent?: number;
    }
}

const AccountSummary: React.FC = () => {
    const [searchText, setSearchText] = useState('');
    const [selectedUser, setSelectedUser] = useState('self'); // Default to self
    const [ledger, setLedger] = useState<LedgerItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [openingBalance, setOpeningBalance] = useState(0);

    const fetchLedger = async () => {
        try {
            setLoading(true);
            const data = await TradeService.getAccountSummary();
            setLedger(data.ledger || []);
            setOpeningBalance(data.summary?.opening_balance || 0);
        } catch (error) {
            console.error('Failed to fetch ledger:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLedger();
    }, []);

    const handleRefresh = (event: CustomEvent) => {
        fetchLedger().finally(() => event.detail.complete());
    };

    const filteredLedger = ledger.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.symbol.toLowerCase().includes(searchText.toLowerCase());

        // Fix: If selectedUser is 'self', we show everything for now or match with 'Unknown' 
        // because the dummy records often have 'Unknown' or the actual username.
        // In a real app, 'self' would match the logged-in user's username.
        let matchesUser = true;
        if (selectedUser && selectedUser !== 'self') {
            matchesUser = item.username === selectedUser;
        }

        return matchesSearch && matchesUser;
    });

    const formatTimestamp = (ts: string) => {
        try {
            return format(new Date(ts), 'MMM-dd HH:mm:ss');
        } catch (e) {
            return ts;
        }
    };

    return (
        <IonPage className="account-summary-page">
            <CommonHeader title="Account Summary" />
            <IonContent className="ion-padding compact-content">
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent></IonRefresherContent>
                </IonRefresher>

                <div className="mb-12">
                    <DateFilter />
                </div>

                <UserFilter
                    onUserChange={setSelectedUser}
                    includeSelf
                    label="Select User"
                />

                <div className="action-row-compact">
                    <CommonSearch
                        value={searchText}
                        onChange={setSearchText}
                        placeholder="Search exchange or script"
                    />
                    <div className="filter-box" onClick={fetchLedger}>
                        <IonIcon icon={searchOutline} />
                    </div>
                    <div className="reset-icon-box" onClick={() => { setSearchText(''); setSelectedUser('self'); }}>
                        <IonIcon icon={refreshOutline} />
                    </div>
                </div>

                <div className="balance-strip-compact">
                    <span className="balance-label">Opening Balance</span>
                    <span className={`balance-value ${openingBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                        {openingBalance.toFixed(3)}
                    </span>
                </div>

                {loading ? (
                    <Loader />
                ) : (
                    <div className="ledger-list mt-8">
                        {filteredLedger.map((item) => (
                            <div key={item.id} className="ledger-item-card">
                                <div className="ledger-top-row">
                                    <span className="script-name">{item.name}</span>
                                    <span className={`amount-value ${item.amount >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {item.amount.toFixed(item.type === 'Brokerage' ? 3 : 1)}
                                    </span>
                                </div>

                                {item.type === 'Profit/Loss' && item.details.entry_price !== undefined && (
                                    <div className="trade-meta-row">
                                        <div className="trade-badge-group">
                                            <div className="qty-box">
                                                <IonIcon icon={refreshOutline} style={{ transform: 'rotate(90deg)', fontSize: '10px' }} />
                                                <span>{item.details.quantity.toFixed(1)}</span>
                                            </div>
                                            <span className={`type-badge ${item.details.action === 'Buy' ? 'buy' : 'sell'}`}>
                                                {item.details.action === 'Buy' ? 'BUY' : 'SELL'}
                                            </span>
                                        </div>
                                        <span className="price-flow">
                                            {item.details.entry_price?.toFixed(1)} → {item.details.exit_price?.toFixed(1)}
                                        </span>
                                    </div>
                                )}

                                <div className="ledger-bottom-row">
                                    <div className="user-section">
                                        <div className="user-info-mini">
                                            <IonIcon icon={personOutline} />
                                            <span>{item.username}</span>
                                        </div>
                                        <div className="type-label-mini">
                                            {item.type}
                                        </div>
                                    </div>
                                    <div className="time-info-mini">
                                        <IonIcon icon={timeOutline} />
                                        <span>{formatTimestamp(item.timestamp)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredLedger.length === 0 && (
                            <div className="no-data-msg">No transactions found for the selected period.</div>
                        )}
                    </div>
                )}

            </IonContent>
        </IonPage>
    );
};

export default AccountSummary;
