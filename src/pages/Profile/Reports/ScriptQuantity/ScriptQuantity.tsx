
import React, { useState } from 'react';
import {
    IonContent, IonPage, IonSelect, IonSelectOption, useIonViewWillEnter
} from '@ionic/react';
import CommonHeader from '../../../../components/CommonHeader';
import Loader from '../../../../components/Loader/Loader';
import './ScriptQuantity.css';
import { getMasterData } from '../../../../services/scriptService';

const ScriptQuantity: React.FC = () => {
    const [masterData, setMasterData] = useState<any[]>([]);
    const [selectedExchangeName, setSelectedExchangeName] = useState<string>('');
    const [selectedGroupName, setSelectedGroupName] = useState<string>('');
    const [scripts, setScripts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await getMasterData(true); // forceRefresh = true
            if (result && result.Success && result.Data) {
                setMasterData(result.Data);

                if (result.Data.length > 0) {
                    const firstEx = result.Data[0];
                    setSelectedExchangeName(firstEx.name);

                    if (firstEx.groups && firstEx.groups.length > 0) {
                        const firstGroup = firstEx.groups[0];
                        setSelectedGroupName(firstGroup.name);
                        setScripts(firstGroup.settings || []);
                    }
                }
            }
        } catch (error) {
            console.error("Error loading master data", error);
        } finally {
            setLoading(false);
        }
    };

    useIonViewWillEnter(() => {
        loadData();
    });

    const handleExchangeChange = (e: CustomEvent) => {
        const exName = e.detail.value;
        setSelectedExchangeName(exName);

        // Find exchange and set first group
        const exchange = masterData.find(ex => ex.name === exName);
        if (exchange && exchange.groups && exchange.groups.length > 0) {
            setSelectedGroupName(exchange.groups[0].name);
            setScripts(exchange.groups[0].settings || []);
        } else {
            setSelectedGroupName('');
            setScripts([]);
        }
    };

    const handleGroupChange = (e: CustomEvent) => {
        const grpName = e.detail.value;
        setSelectedGroupName(grpName);

        const exchange = masterData.find(ex => ex.name === selectedExchangeName);
        if (exchange) {
            const group = exchange.groups.find((g: any) => g.name === grpName);
            if (group) {
                setScripts(group.settings || []);
            }
        }
    };

    const handleViewClick = () => {
        // Data is already updated via onIonChange, but we can re-sync if needed
    };

    return (
        <IonPage>
            <CommonHeader title="Script Quantity" />
            <IonContent className="admin-bg relative">
                {loading && <Loader overlay />}

                <div className="script-qty-wrapper">

                    {/* Row 1: Exchange and Group Dropdowns */}
                    <div className="filter-row">
                        <div className="filter-card half-width">
                            <IonSelect
                                value={selectedExchangeName}
                                interface="action-sheet"
                                className="brand-select"
                                onIonChange={handleExchangeChange}
                                placeholder="Exchange"
                            >
                                {masterData.map((ex) => (
                                    <IonSelectOption key={ex.name} value={ex.name}>
                                        {ex.name}
                                    </IonSelectOption>
                                ))}
                            </IonSelect>
                        </div>
                        <div className="filter-card half-width">
                            <IonSelect
                                value={selectedGroupName}
                                interface="action-sheet"
                                className="brand-select"
                                onIonChange={handleGroupChange}
                                placeholder="Group"
                            >
                                {masterData.find(ex => ex.name === selectedExchangeName)?.groups.map((grp: any) => (
                                    <IonSelectOption key={grp.name} value={grp.name}>
                                        {grp.name}
                                    </IonSelectOption>
                                ))}
                            </IonSelect>
                        </div>
                    </div>

                    {/* View Button - Full Width */}
                    <button className="btn-view-full-large" onClick={handleViewClick}>
                        View
                    </button>

                    {/* Group Name Info Bar */}
                    {selectedGroupName && (
                        <div className="info-bar">
                            <span className="info-label">Group Name :</span>
                            <span className="info-value">{selectedGroupName}</span>
                        </div>
                    )}

                    {/* Table Section */}
                    <div className="qty-table-container">
                        <div className="qty-table-header">
                            <div className="qty-th symbol-col">Symbol ↑</div>
                            <div className="qty-th">Breakup Qty ↑</div>
                            <div className="qty-th">Max Qty ↑</div>
                        </div>

                        <div className="qty-table-body">
                            {scripts.length > 0 ? (
                                scripts.map((item, index) => (
                                    <div className={`qty-tr ${index % 2 !== 0 ? 'alt-row' : ''}`} key={index}>
                                        <div className="qty-td symbol-col">{item.symbol}</div>
                                        <div className="qty-td">{item.breakup_qty}</div>
                                        <div className="qty-td">{item.max_qty}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="qty-tr">
                                    <div className="qty-td" style={{ gridColumn: 'span 3', textAlign: 'center' }}>
                                        No data found
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

export default ScriptQuantity;