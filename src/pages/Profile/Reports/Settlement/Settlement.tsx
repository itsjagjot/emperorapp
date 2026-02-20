
import React, { useState, useEffect } from 'react';
import {
    IonContent, IonPage, IonRadioGroup, IonRadio, IonLabel, IonIcon, useIonLoading
} from '@ionic/react';
import { downloadOutline, trendingUpOutline, trendingDownOutline, statsChartOutline } from 'ionicons/icons';
import CommonHeader from '../../../../components/CommonHeader';
import DateFilter from '../../../../components/DateFilter';
import UserFilter from '../../../../components/UserFilter';
import TradeService, { TradeOrder } from '../../../../services/TradeService';
import TradeBill from '../GenerateBill/TradeBill';
import './Settlement.css';

interface SettlementItem {
    username: string;
    grossPL: number;
    brokerage: number;
    netPL: number;
}

const SettlementsReport: React.FC = () => {
    const [withOpening, setWithOpening] = useState('no');
    const [selectedUser, setSelectedUser] = useState<string>('all');
    // Date range state
    const [dateRange, setDateRange] = useState<{ start: string | null, end: string | null }>({
        start: null,
        end: null
    });

    const [present, dismiss] = useIonLoading();
    const [settlementData, setSettlementData] = useState<{
        profitUsers: SettlementItem[],
        lossUsers: SettlementItem[],
        totalNetPL: number
    }>({
        profitUsers: [],
        lossUsers: [],
        totalNetPL: 0
    });
    const [hasLoaded, setHasLoaded] = useState(false);

    // Trade Bill Integration
    const [filteredTrades, setFilteredTrades] = useState<TradeOrder[]>([]);
    const [showBill, setShowBill] = useState(false);

    const handleSearch = async () => {
        await present({
            message: 'Generating Report...',
        });

        try {
            const allTrades = await TradeService.getOrders('Success');

            if (!allTrades || !Array.isArray(allTrades)) {
                setSettlementData({ profitUsers: [], lossUsers: [], totalNetPL: 0 });
                setHasLoaded(true);
                return;
            }

            // 1. Filter by User
            let filtered = allTrades;
            if (selectedUser && selectedUser !== 'all' && selectedUser !== 'self') {
                filtered = filtered.filter(t =>
                    String(t.username).toLowerCase() === selectedUser.toLowerCase() ||
                    String(t.user_id) === selectedUser
                );
            }

            // Filter by Date Range
            if (dateRange.start && dateRange.end) {
                const startDate = new Date(dateRange.start);
                const endDate = new Date(dateRange.end);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);

                filtered = filtered.filter(t => {
                    if (!t.order_time) return false;
                    const tradeDate = new Date(t.order_time);
                    return tradeDate >= startDate && tradeDate <= endDate;
                });
            }

            // Store filtered trades for Trade Bill Report
            setFilteredTrades(filtered);

            // 2. Group by User and Calculate P&L
            const userGroups: { [key: string]: any[] } = {};

            filtered.forEach(trade => {
                const uname = trade.username || 'Unknown';
                if (!userGroups[uname]) userGroups[uname] = [];
                userGroups[uname].push(trade);
            });

            const processedUsers: SettlementItem[] = [];

            Object.keys(userGroups).forEach(username => {
                const trades = userGroups[username];

                // Group by script for accurate P&L (Buy/Sell Vol logic)
                const scriptGroups: { [key: string]: any[] } = {};
                trades.forEach(t => {
                    if (!scriptGroups[t.name]) scriptGroups[t.name] = [];
                    scriptGroups[t.name].push(t);
                });

                let userGrossPL = 0;
                let userBrokerage = 0;

                Object.values(scriptGroups).forEach(scriptTrades => {
                    // Use 'deals' field for P&L as per user instruction
                    const scriptPL = scriptTrades.reduce((sum, t) => sum + Number(t.deals || 0), 0);
                    userGrossPL += scriptPL;
                    userBrokerage += scriptTrades.reduce((sum, t) => sum + Number(t.brokerage || 0), 0);
                });

                // Net P&L = Gross P&L - Brokerage
                const netPL = userGrossPL - userBrokerage;

                processedUsers.push({
                    username,
                    grossPL: userGrossPL,
                    brokerage: userBrokerage,
                    netPL: netPL
                });
            });

            const profitUsers = processedUsers.filter(u => u.netPL >= 0);
            const lossUsers = processedUsers.filter(u => u.netPL < 0);

            const totalNet = processedUsers.reduce((sum, u) => sum + u.netPL, 0);

            setSettlementData({
                profitUsers,
                lossUsers,
                totalNetPL: totalNet
            });
            setHasLoaded(true);

        } catch (error) {
            console.error('Failed to fetch trades', error);
        } finally {
            dismiss();
        }
    };

    const formatCurrency = (val: number) => {
        return Math.abs(val).toFixed(0);
    };

    // Auto-trigger search when filters change
    useEffect(() => {
        if (dateRange.start && dateRange.end) {
            handleSearch();
        }
    }, [dateRange.start, dateRange.end, selectedUser]);

    const handleDownload = () => {
        // Show TradeBill view
        setShowBill(true);
        // Auto print after short delay
        setTimeout(() => {
            if (window.innerWidth > 768) {
                // window.print();
            }
        }, 500);
    };

    if (showBill) {
        return (
            <IonPage>
                <CommonHeader
                    title="View Report"
                    backLink={undefined}
                    onAction={() => window.print()}
                    actionIcon={downloadOutline}
                />
                <IonContent>
                    <div className="report-view-container" style={{ height: '100%', overflowY: 'auto' }}>
                        <TradeBill
                            trades={filteredTrades}
                            userId={selectedUser === 'all' ? 'ALL USERS SUMMARY' : (selectedUser === 'self' ? 'SELF REPORT' : selectedUser)}
                            startDate={dateRange.start || undefined}
                            endDate={dateRange.end || undefined}
                        />
                        <div className="no-print" style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', zIndex: 999 }}>
                            <button className="btn-view-full" onClick={() => setShowBill(false)}>
                                Back to Summary
                            </button>
                        </div>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <CommonHeader title="Settlement Report" />
            <IonContent className="admin-bg">

                <div className="settlement-wrapper">

                    {/* Row 1: Date Filter */}
                    <DateFilter onDateChange={(start, end) => setDateRange({ start, end })} />

                    {/* Row 2: Select User */}
                    <div className="filter-card full-width">
                        <UserFilter
                            onUserChange={setSelectedUser}
                            includeSelf
                            label="Select User"
                        />
                    </div>

                    {/* Row 3: With Opening Radio Buttons */}
                    <div className="opening-section">
                        <p className="section-label">With Opening:</p>
                        <IonRadioGroup value={withOpening} onIonChange={e => setWithOpening(e.detail.value)}>
                            <div className="radio-flex">
                                <div className="radio-item">
                                    <IonRadio value="yes" mode="md" />
                                    <IonLabel>Yes</IonLabel>
                                </div>
                                <div className="radio-item">
                                    <IonRadio value="no" mode="md" />
                                    <IonLabel>No</IonLabel>
                                </div>
                            </div>
                        </IonRadioGroup>
                    </div>

                    {/* Row 4: Action Buttons (Side by Side) */}
                    <div className="filter-row">
                        <button className="btn-reset-full" onClick={() => {
                            setSettlementData({ profitUsers: [], lossUsers: [], totalNetPL: 0 });
                            setHasLoaded(false);
                        }}>Reset</button>
                        <button className="btn-view-full" onClick={handleSearch}>View</button>
                    </div>

                    {/* Status Bars Section - Only Show if Data Loaded or Empty State? Screenshot shows them always? Or usually after view. Let's show always but empty if 0 */}

                    <div className="status-bars-container">
                        <button className="status-bar download-bar" onClick={handleDownload}>
                            <div className="bar-left">
                                <IonIcon icon={downloadOutline} />
                                <span>Download Report</span>
                            </div>
                            <IonIcon icon={downloadOutline} className="end-icon" />
                        </button>

                        <div className="status-bar summary-bar">
                            <div className="bar-left">
                                <IonIcon icon={statsChartOutline} />
                                <span>Total Profit & Loss</span>
                            </div>
                            <span className={`count-badge ${settlementData.totalNetPL >= 0 ? 'green-text' : 'red-text'}`}>
                                {settlementData.totalNetPL.toFixed(0)}
                            </span>
                        </div>

                        {/* PROFIT Section */}
                        <div className="profit-section-wrapper">
                            <div className="status-bar profit-bar">
                                <div className="bar-left">
                                    <IonIcon icon={trendingUpOutline} />
                                    <span>PROFIT</span>
                                </div>
                                <IonIcon icon={trendingUpOutline} className="arrow-icon" />
                            </div>

                            {(hasLoaded && settlementData.profitUsers.length > 0) && (
                                <div className="settlement-table-container">
                                    <div className="settlement-table-header">
                                        <div className="col-name">Username</div>
                                        <div className="col val-right">P&L</div>
                                        <div className="col val-right">Brk</div>
                                        <div className="col val-right">Total</div>
                                    </div>
                                    {settlementData.profitUsers.map((u, i) => (
                                        <div className="settlement-table-row" key={i}>
                                            <div className="col-name">{u.username}</div>
                                            <div className="col val-right">{formatCurrency(u.grossPL)}</div>
                                            <div className="col val-right">{formatCurrency(u.brokerage)}</div>
                                            <div className="col val-right blue-text">{formatCurrency(u.netPL)}</div>
                                        </div>
                                    ))}
                                    <div className="settlement-table-row total-row">
                                        <div className="col-name">TOTAL</div>
                                        <div className="col val-right">
                                            {formatCurrency(settlementData.profitUsers.reduce((s, u) => s + u.grossPL, 0))}
                                        </div>
                                        <div className="col val-right">
                                            {formatCurrency(settlementData.profitUsers.reduce((s, u) => s + u.brokerage, 0))}
                                        </div>
                                        <div className="col val-right blue-text">
                                            {formatCurrency(settlementData.profitUsers.reduce((s, u) => s + u.netPL, 0))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* LOSS Section */}
                        <div className="loss-section-wrapper">
                            <div className="status-bar loss-bar">
                                <div className="bar-left">
                                    <IonIcon icon={trendingDownOutline} />
                                    <span>LOSS</span>
                                </div>
                                <IonIcon icon={trendingDownOutline} className="arrow-icon" />
                            </div>

                            {(hasLoaded && settlementData.lossUsers.length > 0) && (
                                <div className="settlement-table-container">
                                    <div className="settlement-table-header">
                                        <div className="col-name">Username</div>
                                        <div className="col val-right">P&L</div>
                                        <div className="col val-right">Brk</div>
                                        <div className="col val-right">Total</div>
                                    </div>
                                    {settlementData.lossUsers.map((u, i) => (
                                        <div className="settlement-table-row" key={i}>
                                            <div className="col-name red-text">{u.username}</div>
                                            <div className="col val-right">{Number(u.grossPL).toFixed(0)}</div>
                                            <div className="col val-right">{Number(u.brokerage).toFixed(0)}</div>
                                            <div className="col val-right red-text">{Number(u.netPL).toFixed(0)}</div>
                                        </div>
                                    ))}
                                    <div className="settlement-table-row total-row">
                                        <div className="col-name">TOTAL</div>
                                        <div className="col val-right">
                                            {settlementData.lossUsers.reduce((s, u) => s + u.grossPL, 0).toFixed(0)}
                                        </div>
                                        <div className="col val-right">
                                            {settlementData.lossUsers.reduce((s, u) => s + u.brokerage, 0).toFixed(0)}
                                        </div>
                                        <div className="col val-right red-text">
                                            {settlementData.lossUsers.reduce((s, u) => s + u.netPL, 0).toFixed(0)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default SettlementsReport;