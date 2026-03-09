import React from 'react';
import {
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonButton,
    IonIcon
} from '@ionic/react';
import { chevronBackOutline } from 'ionicons/icons';
import TickerBanner from './TickerBanner/TickerBanner';

interface CommonHeaderProps {
    title: string;
    backLink?: string;
    actionIcon?: string;
    onAction?: () => void;
    onBack?: () => void;
    adv?: boolean;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({ title, backLink = "/app/profile", actionIcon, onAction, onBack, adv }) => {
    return (
        <>
            <IonHeader className="common-header">
                <IonToolbar>
                    <IonButtons slot="start">
                        {onBack ? (
                            <IonButton onClick={onBack}><IonIcon icon={chevronBackOutline} /></IonButton>
                        ) : backLink == 'back()' ? (
                            <IonButton onClick={() => window.history.back()}><IonIcon icon={chevronBackOutline} /></IonButton>
                        ) : backLink == 'none' ? (
                            null
                        ) : (
                            <IonBackButton defaultHref={backLink} text="" />
                        )}
                    </IonButtons>

                    <IonTitle>{title}</IonTitle>

                    {actionIcon && onAction && (
                        <IonButtons slot="end">
                            <IonButton onClick={onAction}>
                                <IonIcon icon={actionIcon} />
                            </IonButton>
                        </IonButtons>
                    )}
                </IonToolbar>
            </IonHeader>
            {adv && <TickerBanner />}
        </>
    );
};

export default CommonHeader;
