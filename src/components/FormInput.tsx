import React, { useState } from 'react';
import { IonIcon, IonItem, IonInput, IonLabel } from '@ionic/react';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';

interface FormInputProps {
    label: string;
    value: string;
    type?: 'text' | 'password';
    placeholder?: string;
    icon?: string;
    onChange: (value: string) => void;
    showToggle?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
    label,
    value,
    type = 'text',
    placeholder,
    icon,
    onChange,
    showToggle = false
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = showToggle ? (showPassword ? 'text' : 'password') : type;

    return (
        <div style={{ marginBottom: '16px' }}>
            <IonLabel style={{ display: 'block', marginBottom: '8px', color: '#666', fontSize: '14px', fontWeight: '500' }}>{label}</IonLabel>
            <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                padding: '0 12px',
                background: '#fff',
                height: '48px'
            }}>
                <IonInput
                    type={inputType as any}
                    value={value}
                    onIonInput={e => onChange(e.detail.value!)}
                    placeholder={placeholder}
                    style={{ '--padding-start': '0', '--background': 'transparent' }}
                />
                {icon && !showToggle && (
                    <IonIcon icon={icon} style={{ color: '#0F3D2E', fontSize: '20px' }} />
                )}
                {showToggle && (
                    <IonIcon
                        icon={showPassword ? eyeOffOutline : eyeOutline}
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ color: '#0F3D2E', fontSize: '20px', cursor: 'pointer' }}
                    />
                )}
            </div>
        </div>
    );
};

export default FormInput;
