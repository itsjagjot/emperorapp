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

interface CommonHeaderProps {
    title: string;
    backLink?: string;
    actionIcon?: string;
    onAction?: () => void;
    onBack?: () => void;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({ title, backLink = "/app/profile", actionIcon, onAction, onBack }) => {
    return (
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
    );
};

export default CommonHeader;
