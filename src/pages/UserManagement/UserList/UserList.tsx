import React from 'react';
import {
    IonContent,
    IonPage,
    IonSearchbar,
    IonButton,
    IonIcon,
    IonBadge,
    IonGrid,
    IonRow,
    IonCol
} from '@ionic/react';
import { funnel } from 'ionicons/icons'; // Funnel icon exact screenshot vangu lagda hai
import CommonHeader from '../../../components/CommonHeader';
import './UserList.css';

const UserList: React.FC = () => {
    // Dummy Data for 3 Users
    const users = [
        { id: 'ks001', name: 'Ks01', status: 'Active', balance: '0', credit: '100000', pl: '0.0%' },
        { id: 'as002', name: 'Amit02', status: 'Active', balance: '500', credit: '50000', pl: '2.5%' },
        { id: 'rs003', name: 'Rohit03', status: 'Inactive', balance: '0', credit: '20000', pl: '0.0%' }
    ];

    return (
        <IonPage className="user-list-page">
            <CommonHeader title="User List" />

            <IonContent className="ion-padding">
                {/* Search and Filter Section */}
                <div className="search-filter-wrapper">
                    <IonSearchbar placeholder="Search users..." className="custom-searchbar"></IonSearchbar>
                    <div className="filter-box">
                        <IonIcon icon={funnel} />
                    </div>
                </div>

                <div className="stats-row">
                    <span>Total Users: {users.length}</span>
                    <span>Showing {users.length} of {users.length}</span>
                </div>

                {/* Mapping Users to Cards */}
                {users.map((user) => (
                    <div className="user-card" key={user.id}>
                        <div className="card-header">
                            <div className="user-info">
                                <div className="avatar-circle">{user.name.charAt(0)}</div>
                                <div className="name-section">
                                    <h3>{user.name}</h3>
                                    <p>{user.id}</p>
                                </div>
                            </div>
                            <IonBadge color={user.status === 'Active' ? 'success' : 'medium'} className="status-badge">
                                {user.status}
                            </IonBadge>
                        </div>

                        <IonGrid className="card-details">
                            <IonRow>
                                <IonCol size="4" className="detail-col border-right">
                                    <p className="label">Balance</p>
                                    <p className={`value ${user.balance === '0' ? 'red' : ''}`}>{user.balance}</p>
                                </IonCol>
                                <IonCol size="4" className="detail-col border-right">
                                    <p className="label">Credit</p>
                                    <p className="value green">{user.credit}</p>
                                </IonCol>
                                <IonCol size="4" className="detail-col">
                                    <p className="label">PL Sharing</p>
                                    <p className="value red">{user.pl}</p>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </div>
                ))}
            </IonContent>
        </IonPage>
    );
};

export default UserList;