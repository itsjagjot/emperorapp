import React from 'react';
import {
    IonContent, IonPage, IonGrid, IonRow, IonCol, IonText
} from '@ionic/react';
import CommonHeader from '../../../../components/CommonHeader';
import './CfMargin.css';

const CfMargin: React.FC = () => {
    return (
        <IonPage>
            <CommonHeader title="Cf Margin SquareOff" />
            <IonContent className="admin-bg">

                {/* Warning Message from image_6123db */}
                <div className="warning-container">
                    <p className="warning-text">
                        The Positions Listed Below will be Squared Off and Can Not be Carry Forward Once The Exchange Has Closed.
                    </p>
                </div>

                {/* Positions Table/List Container */}
                {/* <div className="positions-wrapper">
                    <div className="scrollable-table-container">
                        <div className="table-min-width">
                            <div className="table-header-row">
                                <div className="th-item desc-col">Script ↑</div>
                                <div className="th-item">User</div>
                                <div className="th-item">Qty</div>
                                <div className="th-item">Avg Price</div>
                                <div className="th-item">LTP</div>
                                <div className="th-item">M2M</div>
                            </div>

                            <div className="empty-state-margin">
                                <p>No carry forward positions found</p>
                            </div>
                        </div>
                    </div>
                </div> */}

            </IonContent>
        </IonPage>
    );
};

export default CfMargin;