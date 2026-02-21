import React, { useState, useEffect } from 'react';
import {
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonIcon, IonLabel, IonDatetimeButton, IonDatetime,
    IonSelect, IonSelectOption
} from '@ionic/react';
import { closeOutline, searchOutline, refreshOutline } from 'ionicons/icons';
import { getMasterData } from '../../services/scriptService';
import './FilterModal.css';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: {
        fromDate?: string;
        toDate?: string;
        exchange?: string;
        symbol?: string;
    }) => void;
    onReset: () => void;
    showDateFilter?: boolean;
    showExchangeFilter?: boolean;
    showScriptFilter?: boolean;
    initialFilters?: {
        fromDate?: string;
        toDate?: string;
        exchange?: string;
        symbol?: string;
    };
}

const FilterModal: React.FC<FilterModalProps> = ({
    isOpen,
    onClose,
    onApply,
    onReset,
    showDateFilter = true,
    showExchangeFilter = true,
    showScriptFilter = true,
    initialFilters
}) => {
    const today = new Date().toISOString().split('T')[0];
    const [fromDate, setFromDate] = useState<string>(initialFilters?.fromDate || today);
    const [toDate, setToDate] = useState<string>(initialFilters?.toDate || today);
    const [selectedExchange, setSelectedExchange] = useState<string>(initialFilters?.exchange || '');
    const [selectedSymbol, setSelectedSymbol] = useState<string>(initialFilters?.symbol || '');

    const [masterData, setMasterData] = useState<any[]>([]);
    const [filteredExchanges, setFilteredExchanges] = useState<string[]>([]);
    const [filteredScripts, setFilteredScripts] = useState<string[]>([]);

    useEffect(() => {
        if (showExchangeFilter || showScriptFilter) {
            loadMasterData();
        }
    }, [showExchangeFilter, showScriptFilter]);

    useEffect(() => {
        if (initialFilters) {
            setFromDate(initialFilters.fromDate || today);
            setToDate(initialFilters.toDate || today);
            setSelectedExchange(initialFilters.exchange || '');
            setSelectedSymbol(initialFilters.symbol || '');
        }
    }, [initialFilters]);

    const loadMasterData = async () => {
        try {
            const result = await getMasterData();
            if (result && result.Success && Array.isArray(result.Data)) {
                setMasterData(result.Data);
                const exchanges = result.Data.map((ex: any) => ex.name);
                setFilteredExchanges(exchanges);

                // If exchange is already selected, populate scripts
                if (selectedExchange) {
                    populateScripts(selectedExchange, result.Data);
                }
            }
        } catch (error) {
            console.error("Error loading master data in FilterModal", error);
        }
    };

    const populateScripts = (exName: string, data: any[]) => {
        const exchange = data.find(ex => ex.name === exName);
        if (exchange && exchange.groups) {
            const allSymbols: string[] = [];
            exchange.groups.forEach((group: any) => {
                if (group.settings) {
                    group.settings.forEach((setting: any) => {
                        if (setting.symbol && !allSymbols.includes(setting.symbol)) {
                            allSymbols.push(setting.symbol);
                        }
                    });
                }
            });
            setFilteredScripts(allSymbols);
        } else {
            setFilteredScripts([]);
        }
    };

    const handleExchangeChange = (exName: string) => {
        setSelectedExchange(exName);
        setSelectedSymbol('');
        populateScripts(exName, masterData);
    };

    const handleApply = () => {
        onApply({
            fromDate: showDateFilter ? fromDate : undefined,
            toDate: showDateFilter ? toDate : undefined,
            exchange: showExchangeFilter ? selectedExchange : undefined,
            symbol: showScriptFilter ? selectedSymbol : undefined,
        });
    };

    const handleReset = () => {
        setFromDate(minDate);
        setToDate(today);
        setSelectedExchange('');
        setSelectedSymbol('');
        setFilteredScripts([]);
        onReset();
    };

    const todayObj = new Date();

    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(todayObj.getDate() - 14); // 15 days including today
    const minDate = fifteenDaysAgo.toISOString().split('T')[0];

    return (
        <IonModal
            isOpen={isOpen}
            onDidDismiss={onClose}
            className="common-filter-modal"
            initialBreakpoint={0.7}
            breakpoints={[0, 0.7, 1]}
        >
            <IonHeader className="ion-no-border">

            </IonHeader>
            <IonContent className="ion-padding">
                <div className="filter-form">
                    {showDateFilter && (
                        <>
                            <div className="select-input-group">
                                <IonLabel>Date Range</IonLabel>
                                <div className="date-inputs-row">
                                    <div className="pill-date-box">
                                        <span className="date-label">From:</span>
                                        <IonDatetimeButton datetime="modalFromDate" />
                                    </div>
                                    <div className="pill-date-box">
                                        <span className="date-label">To:</span>
                                        <IonDatetimeButton datetime="modalToDate" />
                                    </div>
                                </div>
                            </div>

                            <IonModal keepContentsMounted={true}>
                                <IonDatetime
                                    id="modalFromDate"
                                    presentation="date"
                                    value={fromDate}
                                    onIonChange={e => setFromDate(e.detail.value as string)}
                                    showDefaultButtons={true}
                                    max={today}
                                    min={minDate}
                                />
                            </IonModal>
                            <IonModal keepContentsMounted={true}>
                                <IonDatetime
                                    id="modalToDate"
                                    presentation="date"
                                    value={toDate}
                                    onIonChange={e => setToDate(e.detail.value as string)}
                                    showDefaultButtons={true}
                                    max={today}
                                    min={minDate}
                                />
                            </IonModal>
                        </>
                    )}

                    {showExchangeFilter && (
                        <div className="select-input-group">
                            <IonLabel>Select Exchange</IonLabel>
                            <IonSelect
                                value={selectedExchange}
                                placeholder="Select Exchange"
                                onIonChange={e => handleExchangeChange(e.detail.value)}
                                interface="action-sheet"
                                className="filter-select"
                            >
                                <IonSelectOption value="">All Exchanges</IonSelectOption>
                                {filteredExchanges.map(ex => (
                                    <IonSelectOption key={ex} value={ex}>{ex}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </div>
                    )}

                    {showScriptFilter && (
                        <div className="select-input-group">
                            <IonLabel>Select Script</IonLabel>
                            <IonSelect
                                value={selectedSymbol}
                                placeholder="Select Script"
                                onIonChange={e => setSelectedSymbol(e.detail.value)}
                                interface="action-sheet"
                                className="filter-select"
                                disabled={!selectedExchange && showExchangeFilter}
                            >
                                <IonSelectOption value="">All Scripts</IonSelectOption>
                                {filteredScripts.map(script => (
                                    <IonSelectOption key={script} value={script}>{script}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </div>
                    )}

                    <div className="filter-actions-row">
                        <IonButton expand="block" fill="outline" color="medium" onClick={handleReset} className="action-btn">
                            <IonIcon slot="start" icon={refreshOutline} />
                            Reset
                        </IonButton>
                        <IonButton expand="block" onClick={handleApply} className="action-btn main apply-btn">
                            <IonIcon slot="start" icon={searchOutline} />
                            Apply Filter
                        </IonButton>
                    </div>
                </div>
            </IonContent>
        </IonModal>
    );
};

export default FilterModal;
