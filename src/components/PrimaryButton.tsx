import React from 'react';
import { IonButton } from '@ionic/react';

interface PrimaryButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    full?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, onClick, full = false }) => {
    return (
        <IonButton
            expand={full ? 'block' : undefined}
            onClick={onClick}
            style={{
                '--background': 'var(--ion-color-primary)',
                '--color': 'var(--ion-color-secondary)',
                '--border-radius': '25px',
                fontWeight: 'bold',
                fontSize: '16px',
                height: '50px',
                boxShadow: '0 4px 10px rgba(15, 61, 46, 0.4)'
            }}
        >
            {children}
        </IonButton>
    );
};

export default PrimaryButton;
