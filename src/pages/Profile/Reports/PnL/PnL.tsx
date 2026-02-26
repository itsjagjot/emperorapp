import React, { useState } from 'react';
import {
    IonContent, IonPage, IonSelect, IonSelectOption, IonIcon, IonGrid, IonRow, IonCol, useIonViewWillEnter, IonRefresher, IonRefresherContent
} from '@ionic/react';
import { searchOutline, refreshOutline, statsChartOutline } from 'ionicons/icons';
import CommonHeader from '../../../../components/CommonHeader';
import userService from '../../../../services/userService';
import reportService from '../../../../services/reportService';
import Loader from '../../../../components/Loader/Loader';
import './PnL.css';

const PnL: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [pnlData, setPnlData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersData, pnlSummary] = await Promise.all([
                userService.getAccessibleUsers(),
                reportService.getPnLSummary('EMPEROR', selectedUser)
            ]);
            setUsers(usersData);
            setPnlData(pnlSummary);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useIonViewWillEnter(() => {
        fetchData();
    });

    const handleRefresh = async (e: any) => {
        await fetchData();
        e.detail.complete();
    };

    const formatValue = (val: number) => {
        const num = Number(val || 0);
        return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getColorClass = (val: number) => {
        if (val > 0) return 'text-success';
        if (val < 0) return 'text-danger';
        return '';
    };

    return (
        <IonPage>
            <CommonHeader title="Profit & Loss" />
            <IonContent className="admin-bg">
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent></IonRefresherContent>
                </IonRefresher>

                {loading && <Loader />}

                {/* 1. Top Filters */}
                <div className="pnl-filter-container">
                    <div className="dropdown-flex-grow custom-input-box">
                        <IonSelect
                            value={selectedUser}
                            placeholder="All User"
                            interface="action-sheet"
                            className="brand-green-select"
                            onIonChange={e => setSelectedUser(e.detail.value)}
                        >
                            <IonSelectOption value="all">All User</IonSelectOption>
                            {users.map(u => (
                                <IonSelectOption key={u.user_id} value={u.user_name}>
                                    {u.user_name}
                                </IonSelectOption>
                            ))}
                        </IonSelect>
                    </div>

                    <div className="icon-actions-group">
                        <div className="action-circle-btn search-bg" onClick={fetchData}>
                            <IonIcon icon={searchOutline} />
                        </div>
                        <div className="action-circle-btn reset-outline-btn" onClick={() => { setSelectedUser('all'); fetchData(); }}>
                            <IonIcon icon={refreshOutline} />
                        </div>
                    </div>
                </div>

                {/* 2. Dark Summary Header Strip */}
                <div className="pnl-summary-header">
                    <IonIcon icon={statsChartOutline} className="header-icon" />
                    <span>Profit & Loss Summary</span>
                </div>

                {/* 3. PnL Data Table */}
                <div className="pnl-table-container">
                    {/* Table Headings */}
                    <IonGrid className="pnl-grid header-grid">
                        <IonRow>
                            <IonCol size="4">Username</IonCol>
                            <IonCol size="3" className="ion-text-right">Realised P&L</IonCol>
                            <IonCol size="2.5" className="ion-text-right">M2MPL</IonCol>
                            <IonCol size="2.5" className="ion-text-right">Total</IonCol>
                        </IonRow>
                    </IonGrid>

                    {/* Table Rows */}
                    <div className="pnl-rows-scroll">
                        {pnlData && (
                            <>
                                <IonGrid className="pnl-grid data-row total-row">
                                    <IonRow>
                                        <IonCol size="4" className="user-link">TOTAL</IonCol>
                                        <IonCol size="3" className={`ion-text-right val ${getColorClass(pnlData.summary.realised)}`}>
                                            {formatValue(pnlData.summary.realised)}
                                        </IonCol>
                                        <IonCol size="2.5" className={`ion-text-right val ${getColorClass(pnlData.summary.m2m)}`}>
                                            {formatValue(pnlData.summary.m2m)}
                                        </IonCol>
                                        <IonCol size="2.5" className={`ion-text-right val ${getColorClass(pnlData.summary.total)}`}>
                                            {formatValue(pnlData.summary.total)}
                                        </IonCol>
                                    </IonRow>
                                </IonGrid>

                                {pnlData.users.map((row: any) => (
                                    <IonGrid key={row.user_id} className="pnl-grid data-row">
                                        <IonRow>
                                            <IonCol size="4" className="user-link">{row.username.toUpperCase()}</IonCol>
                                            <IonCol size="3" className={`ion-text-right val ${getColorClass(row.realised)}`}>
                                                {formatValue(row.realised)}
                                            </IonCol>
                                            <IonCol size="2.5" className={`ion-text-right val ${getColorClass(row.m2m)}`}>
                                                {formatValue(row.m2m)}
                                            </IonCol>
                                            <IonCol size="2.5" className={`ion-text-right val ${getColorClass(row.total)}`}>
                                                {formatValue(row.total)}
                                            </IonCol>
                                        </IonRow>
                                    </IonGrid>
                                ))}
                            </>
                        )}
                    </div>
                </div>

            </IonContent>
        </IonPage>
    );
};

export default PnL;