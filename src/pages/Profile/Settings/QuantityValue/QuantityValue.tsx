import React, { useState } from 'react';
import {
    IonContent, IonPage, IonInput, IonItem, IonList
} from '@ionic/react';
import CommonHeader from '../../../../components/CommonHeader';
import './QuantityValue.css';

const QuantityValue: React.FC = () => {
    // Default values as per image
    const initialValues = ["5", "10", "50", "100", "250", "500", "1000", "2500"];
    const [values, setValues] = useState<string[]>(initialValues);

    const handleInputChange = (index: number, val: string) => {
        const newValues = [...values];
        newValues[index] = val;
        setValues(newValues);
    };

    const handleReset = () => {
        setValues(initialValues);
    };

    const handleUpdate = () => {
        console.log("Updated Values:", values);
        // Add your API logic here
    };

    return (
        <IonPage>
            <CommonHeader title="Set Quantity Value" />
            <IonContent className="admin-bg">
                <div className="qty-value-container">

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

                    {/* Bottom Action Buttons */}
                    <div className="qty-action-footer">
                        <button className="qty-btn-reset" onClick={handleReset}>
                            Reset
                        </button>
                        <button className="qty-btn-update" onClick={handleUpdate}>
                            Update
                        </button>
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default QuantityValue;