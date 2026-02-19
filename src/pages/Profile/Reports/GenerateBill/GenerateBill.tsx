import React, { useState } from 'react';
import { IonContent, IonPage, IonButton, IonFooter, IonToolbar, IonSelect, IonSelectOption, IonList, IonIcon } from '@ionic/react';
import { chevronDownOutline, searchOutline, swapVerticalOutline } from 'ionicons/icons';
import CommonHeader from '../../../../components/CommonHeader';
import DateFilter from '../../../../components/DateFilter';
import './GenerateBill.css';
import UserFilter from '../../../../components/UserFilter';

const GenerateBill: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [billType, setBillType] = useState<string>('default');
    return (
        <IonPage>
            <CommonHeader title="Generate PDF" />

            <IonContent className="ion-padding gray-bg">
                <div className="form-container">
                    {/* 1. Date Filter Section */}
                    <div className="mb-12">
                        <DateFilter />
                    </div>

                    <div className="mb-12">
                        <UserFilter
                            onUserChange={setSelectedUser}
                            includeSelf
                            label="Select User"
                        />
                    </div>

                    {/* 3. User Select + Search/Reset Icons Row */}
                    <div className="action-row-compact">

                        {/* 3. Bill Type Section */}
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
                        {/* View/Search Icon Button */}
                        <div className="filter-box">
                            <IonIcon icon={searchOutline} />
                        </div>
                    </div>

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