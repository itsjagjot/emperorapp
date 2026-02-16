import React from 'react';
import {
    IonContent, IonPage, IonSearchbar, IonGrid, IonRow, IonCol, IonIcon,
    IonSelect,
    IonSelectOption
} from '@ionic/react';
import { searchOutline, refreshOutline, swapVerticalOutline } from 'ionicons/icons';
import CommonHeader from '../../../../components/CommonHeader';
import DateFilter from '../../../../components/DateFilter';
import './WeeklyAdmin.css';

const WeeklyAdmin: React.FC = () => {
    return (
        <IonPage>
            <CommonHeader title="Weekly Admin" />
            <IonContent className="admin-bg">

                {/* 1. Correct Header Filters (User Filter + Action Icons) */}
                <div className="admin-filter-container">
                    <div className="dropdown-flex-grow custom-input-box compact">
                        <IonSelect
                            placeholder="All User"
                            interface="action-sheet"
                            className="right-icon-select theme-green-text"
                        >
                            <IonSelectOption value="all">All User</IonSelectOption>
                            <IonSelectOption value="hrt90">HRT90</IonSelectOption>
                        </IonSelect>
                    </div>

                    <div className="icon-actions-group">
                        <div className="action-circle-btn search-bg">
                            <IonIcon icon={searchOutline} />
                        </div>
                        <div className="action-circle-btn reset-outline-btn">
                            <IonIcon icon={refreshOutline} />
                        </div>
                    </div>
                </div>

                {/* 2. Custom Searchbar */}
                <div className="search-wrapper">
                    <IonSearchbar placeholder="Search by name" className="custom-search" mode="ios" />
                </div>

                {/* 3. Dark Summary Card - Premium Look */}
                <div className="summary-card-premium">
                    <div className="summary-header">
                        <span className="summary-title">Total Summary</span>
                    </div>

                    <div className="summary-body">
                        <div className="summary-item">
                            <span className="summary-label">Total P&L</span>
                            <span className="summary-value green-text">0</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Realized PL</span>
                            <span className="summary-value green-text">0</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">M2M PL</span>
                            <span className="summary-value green-text">0</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Brk</span>
                            <span className="summary-value green-text">0</span>
                        </div>
                        <div className="summary-item last-item">
                            <span className="summary-label">Admin Profit</span>
                            <span className="summary-value green-text">0</span>
                        </div>
                    </div>
                </div>

                {/* 4. Sort Pills */}
                <div className="sort-section-compact">
                    <span className="sort-hint">Sort by:</span>
                    <div className="sort-pill-green active">Total P&L <IonIcon icon={swapVerticalOutline} /></div>
                    <div className="sort-pill-green">Admin Profit <IonIcon icon={swapVerticalOutline} /></div>
                </div>

                {/* 5. User Detail Card */}
                <div className="user-report-card-premium">
                    <div className="user-header-flex">
                        <div className="user-avatar-green">K</div>
                        <div className="user-text-meta">
                            <span className="id-txt">Ks01</span>
                            <span className="sub-id-txt">Parent: Hrt90</span>
                        </div>
                    </div>

                    <IonGrid className="stats-grid">
                        <IonRow>
                            <IonCol size="6">
                                <label className="stats-label">Realised P&L</label>
                                <div className="theme-green2-text">0.0</div>
                            </IonCol>
                            <IonCol size="6">
                                <label className="stats-label">Brokerage</label>
                                <div className="theme-green2-text">0.0</div>
                            </IonCol>
                        </IonRow>
                        <IonRow className="ion-margin-top">
                            <IonCol size="6">
                                <label className="stats-label">M2M P&L</label>
                                <div className="theme-green2-text">0.00</div>
                            </IonCol>
                            <IonCol size="6">
                                <label className="stats-label">Admin Brokerage</label>
                                <div className="theme-green2-text">0.00</div>
                            </IonCol>
                        </IonRow>
                    </IonGrid>

                    <div className="footer-stats-strip">
                        <div className="f-item"><label>Total P&L</label><span className="theme-green2-text">0.0</span></div>
                        <div className="f-item"><label>Admin Profit</label><span className="theme-green2-text">0.00</span></div>
                        <div className="f-item"><label>Total Admin</label><span className="theme-green2-text">0.00</span></div>
                    </div>
                </div>

            </IonContent>
        </IonPage>
    );
};

export default WeeklyAdmin;