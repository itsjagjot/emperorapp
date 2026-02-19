import React, { useState } from 'react';
import {
    IonSelect,
    IonSelectOption,
    IonRow,
    IonCol,
    IonDatetimeButton,
    IonModal,
    IonDatetime
} from '@ionic/react';
import { chevronDownOutline } from 'ionicons/icons';
import './DateFilter.css';

interface DateFilterProps {
    onDateChange?: (startDate: string | null, endDate: string | null) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ onDateChange }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('This Week');

    // Calculate today and 15 days ago
    const todayObj = new Date();
    const today = todayObj.toISOString().split('T')[0];

    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(todayObj.getDate() - 14); // 15 days including today
    const minDate = fifteenDaysAgo.toISOString().split('T')[0];

    const [customFrom, setCustomFrom] = useState(today);
    const [customTo, setCustomTo] = useState(today);

    const handlePeriodChange = (val: string) => {
        setSelectedPeriod(val);

        let start: string | null = null;
        let end: string | null = today;

        if (val === 'This Week') {
            const curr = new Date();
            const first = curr.getDate() - curr.getDay();
            start = new Date(curr.setDate(first)).toISOString().split('T')[0];
        } else if (val === 'Previous Week') {
            const curr = new Date();
            const first = curr.getDate() - curr.getDay() - 7;
            const last = first + 6;
            start = new Date(curr.setDate(first)).toISOString().split('T')[0];
            end = new Date(new Date().setDate(last)).toISOString().split('T')[0];
        } else if (val === 'Custom period') {
            start = customFrom;
            end = customTo;
        }

        if (onDateChange) {
            onDateChange(start, end);
        }
    };

    const handleCustomDateChange = (type: 'from' | 'to', val: string) => {
        if (type === 'from') setCustomFrom(val);
        else setCustomTo(val);

        if (onDateChange) {
            if (type === 'from') onDateChange(val, customTo);
            else onDateChange(customFrom, val);
        }
    };

    return (
        <div className="date-filter-wrapper">
            {/* Main Select Box */}
            <div className="user-filter-simple">
                <IonSelect
                    className="user-select-simple"
                    value={selectedPeriod}
                    interface="action-sheet"
                    mode="ios"
                    onIonChange={e => handlePeriodChange(e.detail.value)}
                    toggleIcon={chevronDownOutline}
                >
                    <IonSelectOption value="This Week">This Week</IonSelectOption>
                    <IonSelectOption value="Previous Week">Previous Week</IonSelectOption>
                    <IonSelectOption value="Custom period">Custom period</IonSelectOption>
                </IonSelect>
            </div>

            {/* Custom Date Pickers - Only shows when Custom is selected */}
            {selectedPeriod === 'Custom period' && (
                <IonRow className="compact-date-row">
                    <IonCol size="6">
                        <div className="pill-date-box small">
                            <span className="date-label">From:</span>
                            <IonDatetimeButton datetime="dateFrom" />
                        </div>
                    </IonCol>
                    <IonCol size="6">
                        <div className="pill-date-box small">
                            <span className="date-label">To:</span>
                            <IonDatetimeButton datetime="dateTo" />
                        </div>
                    </IonCol>
                </IonRow>
            )}

            {/* Modals for Date Selection */}
            <IonModal keepContentsMounted={true}>
                <IonDatetime
                    id="dateFrom"
                    presentation="date"
                    min={minDate}
                    max={today}
                    value={customFrom}
                    onIonChange={e => handleCustomDateChange('from', e.detail.value as string)}
                    showDefaultButtons={true}
                />
            </IonModal>

            <IonModal keepContentsMounted={true}>
                <IonDatetime
                    id="dateTo"
                    presentation="date"
                    min={minDate}
                    max={today}
                    value={customTo}
                    onIonChange={e => handleCustomDateChange('to', e.detail.value as string)}
                    showDefaultButtons={true}
                />
            </IonModal>
        </div>
    );
};

export default DateFilter;