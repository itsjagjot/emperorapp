import React from 'react';
import { IonContent, IonPage, IonButton, IonFooter, IonToolbar, IonSelect, IonSelectOption, IonList } from '@ionic/react';
import { chevronDownOutline, swapVerticalOutline } from 'ionicons/icons';
import CommonHeader from '../../../../components/CommonHeader';
import DateFilter from '../../../../components/DateFilter';
import './GenerateBill.css';

const GenerateBill: React.FC = () => {
    return (
        <IonPage>
            <CommonHeader title="Generate PDF" />

            <IonContent className="ion-padding gray-bg">
                <div className="form-container">
                    {/* 1. Date Filter Section */}
                    <DateFilter />

                    {/* 2. Select User Section */}
                    <div className="custom-input-box compact">
                        <IonSelect placeholder="Select User" toggleIcon={swapVerticalOutline}>
                            <IonSelectOption value="SuperAdmin">SuperAdmin</IonSelectOption>
                        </IonSelect>
                    </div>

                    {/* 3. Default Section */}
                    <div className="custom-input-box compact">
                        <IonSelect placeholder="Default" toggleIcon={chevronDownOutline}>
                            <IonSelectOption value="default">Default</IonSelectOption>
                        </IonSelect>
                    </div>

                    {/* 4. View Button (Moved right after inputs) */}
                    <IonButton expand="block" className="view-btn-inline">
                        View
                    </IonButton>

                    {/* 5. Result Content Area (Placeholder) */}
                    <div className="result-area">
                        {/* Jo vi content render hona oh ithe aayega */}
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default GenerateBill;