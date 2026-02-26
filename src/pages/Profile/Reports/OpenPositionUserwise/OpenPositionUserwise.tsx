import React, { useState, useEffect } from 'react';
import {
    IonContent, IonPage, IonSelect, IonSelectOption, IonSearchbar, IonSpinner
} from '@ionic/react';
import CommonHeader from '../../../../components/CommonHeader';
import './OpenPositionUserwise.css';
import UserFilter from '../../../../components/UserFilter';
import TradeService from '../../../../services/TradeService';
import { getMasterData } from '../../../../services/scriptService';
import { useRateStore } from '../../../../store/useRateStore';

interface UserwisePosition {
    id: number;
    user_id: number;
    username: string;
    name: string;
    symbol: string;
    action: string;
    quantity: number;
    lot_size: number;
    atp: number;
    brokerage?: number;
    cmp?: number;
    pnl?: number;
    order_time: string;
}

const OpenPositionUserwise: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState('self');
    const [selectedExchange, setSelectedExchange] = useState('');
    const [selectedScript, setSelectedScript] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [positions, setPositions] = useState<UserwisePosition[]>([]);
    const [loading, setLoading] = useState(false);
    const [exchanges, setExchanges] = useState<any[]>([]);
    const [scripts, setScripts] = useState<string[]>([]);

    const liveRates = useRateStore(state => state.rates);

    useEffect(() => {
        const fetchFilters = async () => {
            const res = await getMasterData();
            if (res.Success && res.Data) {
                // res.Data is the array of exchanges
                setExchanges(res.Data || []);
                const allScripts = new Set<string>();
                res.Data.forEach((ex: any) => {
                    ex.groups.forEach((gr: any) => {
                        gr.settings.forEach((sc: any) => {
                            allScripts.add(sc.symbol);
                        });
                    });
                });
                setScripts(Array.from(allScripts).sort());
            }
        };
        fetchFilters();
    }, []);

    const fetchPositions = async () => {
        setLoading(true);
        try {
            const data = await TradeService.getUserwisePositions({
                username: selectedUser === 'all' ? '' : selectedUser,
                exchange_name: selectedExchange,
                symbol: selectedScript
            });
            if (Array.isArray(data)) {
                setPositions(data);
            } else {
                setPositions([]);
            }
        } catch (error) {
            console.error('Failed to fetch userwise positions:', error);
            setPositions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (positions.length === 0 || liveRates.length === 0) return;

        let hasChanges = false;
        const updatedPositions = positions.map(pos => {
            const rate = liveRates.find(r => r.commodity === pos.symbol);
            if (rate) {
                const cmp = pos.action === 'Buy' ? Number(rate.bid) : Number(rate.ask);
                const pnl = pos.action === 'Buy'
                    ? (cmp - pos.atp) * pos.quantity
                    : (pos.atp - cmp) * pos.quantity;

                if (pos.cmp !== cmp || Math.abs((pos.pnl || 0) - pnl) > 0.01) {
                    hasChanges = true;
                    return { ...pos, cmp, pnl };
                }
            }
            return pos;
        });

        if (hasChanges) {
            setPositions(updatedPositions);
        }
    }, [liveRates, positions.length]);

    const handleReset = () => {
        setSelectedUser('self');
        setSelectedExchange('');
        setSelectedScript('');
        setSearchTerm('');
        setPositions([]);
    };

    const filteredPositions = positions.filter(pos =>
        pos.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pos.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pos.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <IonPage>
            <CommonHeader title="Userwise Open Position" />
            <IonContent className="admin-bg">

                <div className="userwise-wrapper">

                    {/* Row 1: Exchange and Script Select */}
                    <div className="filter-row">
                        <div className="filter-card half-width">
                            <IonSelect
                                value={selectedExchange}
                                placeholder="Exchange"
                                interface="action-sheet"
                                className="brand-select"
                                onIonChange={e => setSelectedExchange(e.detail.value)}
                            >
                                <IonSelectOption value="">All Exchange</IonSelectOption>
                                {exchanges.map(ex => (
                                    <IonSelectOption key={ex.id} value={ex.short_name}>{ex.name}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </div>
                        <div className="filter-card half-width">
                            <IonSelect
                                value={selectedScript}
                                placeholder="Select Script"
                                interface="action-sheet"
                                className="brand-select"
                                onIonChange={e => setSelectedScript(e.detail.value)}
                            >
                                <IonSelectOption value="">All Script</IonSelectOption>
                                {scripts.map(sc => (
                                    <IonSelectOption key={sc} value={sc}>{sc}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </div>
                    </div>

                    {/* Row 2: User Select and Action Buttons */}
                    <div className="filter-row">
                        <UserFilter
                            onUserChange={setSelectedUser}
                            includeSelf
                            includeAll
                            label="Select User"
                        />
                        <div className="action-btns">
                            <button className="btn-view" onClick={fetchPositions} disabled={loading}>
                                {loading ? <IonSpinner name="dots" /> : 'View'}
                            </button>
                            <button className="btn-reset" onClick={handleReset}>Reset</button>
                        </div>
                    </div>

                    {/* Row 3: Search Bar */}
                    <div className="search-container">
                        <IonSearchbar
                            value={searchTerm}
                            onIonInput={e => setSearchTerm(e.detail.value!)}
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
                                <div className="th-item">Buy Avg</div>
                                <div className="th-item">Sell Avg</div>
                                <div className="th-item">LTP</div>
                                <div className="th-item">M2M</div>
                            </div>

                            {filteredPositions.map((pos, idx) => (
                                <div key={idx} className="table-data-row">
                                    <div className="td-item desc-col">
                                        <div className="name-bold">{pos.name}</div>
                                        <div className="time-sub">{new Date(pos.order_time).toLocaleString()}</div>
                                    </div>
                                    <div className="td-item">{pos.username}</div>
                                    <div className="td-item qty-val">{pos.quantity}</div>
                                    <div className="td-item">{pos.action === 'Buy' ? pos.atp.toFixed(2) : '-'}</div>
                                    <div className="td-item">{pos.action === 'Sell' ? pos.atp.toFixed(2) : '-'}</div>
                                    <div className="td-item cmp-val">{pos.cmp ? pos.cmp.toFixed(2) : '-'}</div>
                                    <div className={`td-item pnl-val ${(pos.pnl || 0) >= 0 ? 'up' : 'down'}`}>
                                        {(pos.pnl || 0).toFixed(0)}
                                    </div>
                                </div>
                            ))}

                            {!loading && filteredPositions.length === 0 && (
                                <div className="empty-state">
                                    <p>No open positions found</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default OpenPositionUserwise;
