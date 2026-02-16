import React, { useState } from 'react';
import { IonSelect, IonSelectOption, IonRow, IonCol, IonDatetimeButton, IonModal, IonDatetime } from '@ionic/react';
import { chevronDownOutline } from 'ionicons/icons';

const DateFilter: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('This Week');
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="date-filter-wrapper">
            <div className="custom-input-box compact">
                <IonSelect
                    value={selectedPeriod}
                    interface="action-sheet"
                    onIonChange={e => setSelectedPeriod(e.detail.value)}
                    toggleIcon={chevronDownOutline}
                    mode="md"
                >
                    <IonSelectOption value="This Week">This Week</IonSelectOption>
                    <IonSelectOption value="Previous Week">Previous Week</IonSelectOption>
                    <IonSelectOption value="Custom period">Custom period</IonSelectOption>
                </IonSelect>
            </div>

            {selectedPeriod === 'Custom period' && (
                <IonRow className="compact-date-row">
                    <IonCol size="6">
                        <div className="pill-date-box small">
                            <IonDatetimeButton datetime="from" />
                        </div>
                    </IonCol>
                    <IonCol size="6">
                        <div className="pill-date-box small">
                            <IonDatetimeButton datetime="to" />
                        </div>
                    </IonCol>
                </IonRow>
            )}

            <IonModal keepContentsMounted={true}>
                <IonDatetime id="from" presentation="date" max={today} showDefaultButtons={true} doneText="Apply" cancelText="Cancel" />
            </IonModal>
            <IonModal keepContentsMounted={true}>
                <IonDatetime id="to" presentation="date" max={today} showDefaultButtons={true} doneText="Apply" cancelText="Cancel" />
            </IonModal>
        </div>
    );
};

export default DateFilter;