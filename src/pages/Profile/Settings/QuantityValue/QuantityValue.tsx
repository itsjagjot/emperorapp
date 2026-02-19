import React, { useState, useEffect } from 'react';
import {
    IonContent, IonPage, IonInput, IonItem, IonList, IonSpinner
} from '@ionic/react';
import CommonHeader from '../../../../components/CommonHeader';
import { getQuantities, setQuantities } from '../../../../services/authService';
import { useToast } from '../../../../components/Toast/Toast';
import './QuantityValue.css';

const QuantityValue: React.FC = () => {
    const initialValues = ["1", "1", "1", "1", "1", "1", "1", "1"];
    const [values, setValues] = useState<string[]>(initialValues);
    const [loading, setLoading] = useState<boolean>(true);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchQuants = async () => {
            setLoading(true);
            try {
                const response = await getQuantities();
                if (response.success && response.data) {
                    setValues(response.data.map((v: any) => String(v)));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuants();
    }, []);

    const handleInputChange = (index: number, val: string) => {
        const newValues = [...values];
        newValues[index] = val;
        setValues(newValues);
    };

    const handleReset = () => {
        setValues(initialValues);
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const numericQuantities = values.map(v => parseInt(v) || 1);
            const response = await setQuantities(numericQuantities);
            if (response.success) {
                showToast('Quantities updated successfully', 'success');
            } else {
                showToast(response.message || 'Failed to update quantities', 'error');
            }
        } catch (err) {
            showToast('Network error', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <IonPage>
            <CommonHeader title="Set Quantity Value" />
            <IonContent className="admin-bg">
                <div className="qty-value-container">

                    {loading ? (
                        <div className="ion-text-center ion-padding">
                            <IonSpinner name="crescent" color="primary" />
                        </div>
                    ) : (
                        <IonList className="qty-input-list">
                            {values.map((val, index) => (
                                <div key={index} className="qty-input-wrapper">
                                    <IonInput
                                        value={val}
                                        type="number"
                                        onIonInput={(e) => handleInputChange(index, e.detail.value!)}
                                        className="qty-custom-input"
                                    />
                                </div>
                            ))}
                        </IonList>
                    )}

                    {/* Bottom Action Buttons */}
                    <div className="qty-action-footer">
                        <button
                            className="qty-btn-reset"
                            onClick={handleReset}
                            disabled={loading}
                        >
                            Reset
                        </button>
                        <button
                            className="qty-btn-update"
                            onClick={handleUpdate}
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update'}
                        </button>
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default QuantityValue;