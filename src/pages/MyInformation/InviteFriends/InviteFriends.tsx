import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import CommonHeader from '../../../components/CommonHeader';
import './InviteFriends.css';

const InviteFriends: React.FC = () => {
    return (
        <IonPage className="invite-friends-page">
            <CommonHeader title="Invite Friends" />
            <IonContent className="ion-padding">
                <h2>Invite Friends</h2>
            </IonContent>
        </IonPage>
    );
};

export default InviteFriends;
