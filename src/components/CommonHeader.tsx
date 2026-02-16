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
}

const CommonHeader: React.FC<CommonHeaderProps> = ({ title, backLink = "/app/profile", actionIcon, onAction }) => {
    return (
        <IonHeader>
            <IonToolbar>
                <IonButtons slot="start">
                    <IonBackButton defaultHref={backLink} />
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
