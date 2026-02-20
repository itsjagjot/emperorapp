import React, { useState } from 'react';
import { IonContent, IonPage, IonIcon, IonButton, IonSelect, IonSelectOption } from '@ionic/react';
import { chevronDownOutline, searchOutline, shareOutline } from 'ionicons/icons';
import Loader from '../../../../components/Loader/Loader';
import CommonHeader from '../../../../components/CommonHeader';
import DateFilter from '../../../../components/DateFilter';
import './GenerateBill.css';
import UserFilter from '../../../../components/UserFilter';
import TradeService, { TradeOrder } from '../../../../services/TradeService';
import TradeBill from './TradeBill';

const GenerateBill: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<string>('self');
    const [billType, setBillType] = useState<string>('default');
    const [trades, setTrades] = useState<TradeOrder[]>([]);
    const [showReport, setShowReport] = useState(false);
    const [loading, setLoading] = useState(false);

    // Date range state
    const [dateRange, setDateRange] = useState<{ start: string | null, end: string | null }>({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const handleSearch = async () => {
        setLoading(true);

        try {
            const allTrades = await TradeService.getOrders('Success');

            if (!allTrades || !Array.isArray(allTrades)) {
                setTrades([]);
                setShowReport(true);
                return;
            }

            // 2. Local Filtering
            let filtered = allTrades;

            // Filter by User
            if (selectedUser && selectedUser !== 'self') {
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

            setTrades(filtered);
            setShowReport(true);
            // Auto-trigger print after short delay to allow render
            setTimeout(() => {
                if (window.innerWidth > 768) { // Only on desktop/large screens usually
                    // window.print(); // Optional: Users might find this annoying if they just want to view
                }
            }, 500);
        } catch (error) {
            console.error('Failed to fetch trades', error);
            setTrades([]);
            setShowReport(true);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Trade Bill Report',
                    text: `Trade report for ${selectedUser}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing', error);
            }
        } else {
            handlePrint();
        }
    };

    return (
        <IonPage>
            <CommonHeader
                title={showReport ? "View Report" : "Generate PDF"}
                backLink={showReport ? undefined : "back()"}
                actionIcon={showReport ? shareOutline : undefined}
                onAction={showReport ? handleShare : undefined}
            />

            <IonContent className={showReport ? "" : "ion-padding gray-bg relative"}>
                {loading && <Loader overlay />}
                {!showReport ? (
                    <div className="form-container">
                        <div className="mb-12">
                            <DateFilter onDateChange={(start, end) => setDateRange({ start, end })} />
                        </div>

                        <UserFilter
                            onUserChange={setSelectedUser}
                            includeSelf
                            label="Select User"
                        />

                        <div className="action-row-compact">
                            <div className="user-filter-simple">
                                <IonSelect
                                    value={billType}
                                    placeholder="Default"
                                    onIonChange={(e: any) => setBillType(e.detail.value)}
                                    interface="action-sheet"
                                    toggleIcon={chevronDownOutline}
                                    className="user-select-simple"
                                >
                                    <IonSelectOption value="default">Default</IonSelectOption>
                                    <IonSelectOption value="advance">Advance</IonSelectOption>
                                </IonSelect>
                            </div>
                            <IonButton
                                className="filter-box-btn"
                                onClick={handleSearch}
                                color="primary"
                            >
                                <IonIcon icon={searchOutline} />
                            </IonButton>
                        </div>
                    </div>
                ) : (
                    <div className="report-view-container">
                        <TradeBill
                            trades={trades}
                            userId={selectedUser === 'self' ? 'EDEMO912' : selectedUser}
                            startDate={dateRange.start || undefined}
                            endDate={dateRange.end || undefined}
                        />
                        <div className="no-print" style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', zIndex: 999 }}>
                            <IonButton expand="block" fill="solid" color="dark" onClick={() => setShowReport(false)}>
                                Back to Filters
                            </IonButton>
                        </div>
                    </div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default GenerateBill;