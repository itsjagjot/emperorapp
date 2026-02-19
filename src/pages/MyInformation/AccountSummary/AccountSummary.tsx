import React, { useState } from 'react';
import {
    IonContent, IonPage, IonSelect, IonSelectOption,
    IonSearchbar, IonRow, IonCol, IonItem, IonIcon,
    IonDatetimeButton, IonModal, IonDatetime, IonButtons, IonButton
} from '@ionic/react';
import { chevronDownOutline, searchOutline, refreshOutline } from 'ionicons/icons';
import CommonHeader from '../../../components/CommonHeader';
import './AccountSummary.css';
import DateFilter from '../../../components/DateFilter';
import CommonSearch from '../../../components/CommonSearch';
import UserFilter from '../../../components/UserFilter';

const AccountSummary: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('Custom period');
    const today = new Date().toISOString().split('T')[0];
    const [searchText, setSearchText] = useState('');
    const [selectedUser, setSelectedUser] = useState('');

    return (
        <IonPage className="account-summary-page">
            <CommonHeader title="Account Summary" />
            <IonContent className="ion-padding compact-content">

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
                    {/* 4. Grey Search Bar */}
                    <CommonSearch
                        value={searchText}
                        onChange={setSearchText}
                        placeholder="Search"
                    />
                    {/* View/Search Icon Button */}
                    <div className="filter-box">
                        <IonIcon icon={searchOutline} />
                    </div>

                    {/* Clear/Reset Icon Button */}
                    <div className="reset-icon-box">
                        <IonIcon icon={refreshOutline} />
                    </div>
                </div>

                {/* 5. Opening Balance */}
                <div className="balance-strip-compact">
                    <span className="balance-label">Opening Balance</span>
                    <span className="balance-value">0.0</span>
                </div>

            </IonContent>
        </IonPage>
    );
};

export default AccountSummary;