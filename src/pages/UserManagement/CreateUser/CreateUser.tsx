import React, { useState } from 'react';
import {
    IonContent, IonPage, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
    IonToggle, IonCheckbox, IonButton, IonIcon, IonList, useIonToast, useIonViewWillEnter
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
    personCircleOutline, personOutline, lockClosedOutline, globeOutline,
    settingsOutline, addCircleOutline, keyOutline, trendingUpOutline,
    shieldCheckmarkOutline, chevronDownOutline
} from 'ionicons/icons';
import { getMasterData } from '../../../services/scriptService';
import CommonHeader from '../../../components/CommonHeader';
import Loader from '../../../components/Loader/Loader';
import { API_BASE_URL } from '../../../services/config';
import './CreateUser.css';

const CreateUser: React.FC = () => {
    const [present] = useIonToast();
    const history = useHistory();

    // Form State
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        password: '',
        credit: '',
        contactNumber: ''
    });

    const [loading, setLoading] = useState(false);

    // Exchange State
    const [exchanges, setExchanges] = useState<any[]>([]);
    const [masterExchanges, setMasterExchanges] = useState<any[]>([]);

    const fetchMasterData = async () => {
        setLoading(true);
        try {
            const result = await getMasterData(true); // forceRefresh = true
            if (result && result.Success && result.Data) {
                setMasterExchanges(result.Data);
                const initialExchanges = result.Data.map((ex: any) => ({
                    id: ex.id,
                    name: ex.name,
                    enabled: false, // Don't default enable, let user choose
                    turnover: true,
                    lot: false,
                    group: ex.groups && ex.groups.length > 0 ? ex.groups[0].name : 'Default',
                    groupId: ex.groups && ex.groups.length > 0 ? ex.groups[0].id : null,
                    groups: ex.groups || [] // Store available groups here
                }));
                setExchanges(initialExchanges);
            }
        } catch (error) {
            console.error('Error fetching master data:', error);
        } finally {
            setLoading(false);
        }
    };

    useIonViewWillEnter(() => {
        fetchMasterData();
    });

    const handleInputChange = (key: string, value: string) => {
        if (key === 'username') {
            value = value.replace(/[^a-zA-Z0-9]/g, '');
        }
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleExchangeChange = (index: number, field: string, value: any) => {
        const newExchanges = [...exchanges];
        newExchanges[index] = { ...newExchanges[index], [field]: value };
        setExchanges(newExchanges);
    };

    const handleSubmit = async () => {
        if (!formData.username || !formData.fullName || !formData.password) {
            present({
                message: 'Please fill in all required fields (Name, Username, Password)',
                duration: 2000,
                color: 'warning'
            });
            return;
        }

        if (formData.password.length < 6) {
            present({
                message: 'Password must be at least 6 characters long',
                duration: 2000,
                color: 'warning'
            });
            return;
        }

        if (formData.credit) {
            const creditVal = parseFloat(formData.credit);
            if (isNaN(creditVal)) {
                present({
                    message: 'Credit must be a valid number',
                    duration: 2000,
                    color: 'warning'
                });
                return;
            }
            if (creditVal < 0) {
                present({
                    message: 'Credit cannot be negative',
                    duration: 2000,
                    color: 'warning'
                });
                return;
            }
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (!token) {
                present({
                    message: 'You are not logged in.',
                    duration: 2000,
                    color: 'danger'
                });
                return;
            }

            // Transform exchanges array to object format for backend
            const exchangesObj: any = {};
            exchanges.forEach(ex => {
                if (ex.enabled) {
                    exchangesObj[ex.name] = {
                        enabled: true,
                        turnover: ex.turnover,
                        lot: ex.lot,
                        group: ex.group,
                        exchangeId: ex.id,
                        groupId: ex.groupId
                    };
                }
            });

            const payload = {
                Username: formData.username,
                FirstName: formData.fullName,
                Password: formData.password,
                Credit: formData.credit ? Math.abs(parseFloat(formData.credit)) : 0,
                ContactNumber: formData.contactNumber,
                Exchanges: exchangesObj
            };

            const response = await fetch(`${API_BASE_URL}/User`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                present({
                    message: 'User created successfully!',
                    duration: 2000,
                    color: 'success'
                });

                if (data.userId) {
                    history.push(`/app/user-management/details/${data.userId}`);
                } else {
                    // Reset form
                    setFormData({
                        username: '',
                        fullName: '',
                        password: '',
                        credit: '',
                        contactNumber: ''
                    });
                }
            } else {
                present({
                    message: data.message || 'Failed to create user',
                    duration: 3000,
                    color: 'danger'
                });
            }
        } catch (error) {
            console.error(error);
            present({
                message: 'Network error occurred',
                duration: 3000,
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <IonPage className="create-user-page">
            <CommonHeader title="Create New User" />
            <IonContent className="ion-padding emperor-bg relative">
                {loading && <Loader overlay />}

                {/* --- User Identity --- */}
                <div className="modern-card">
                    <div className="card-accent-bar"></div>
                    <div className="card-inner">
                        <div className="card-top">
                            <IonIcon icon={shieldCheckmarkOutline} className="accent-icon" />
                            <h3>User Identity</h3>
                        </div>
                        <IonItem lines="none" className="modern-toggle-item">
                            <IonCheckbox slot="start" mode="md" checked={true} />
                            <IonLabel>Enable Account Creation</IonLabel>
                        </IonItem>
                        <div className="custom-dropdown">
                            <IonSelect value="SuperAdmin" interface="popover" disabled>
                                <IonSelectOption value="SuperAdmin">SuperAdmin (Master)</IonSelectOption>
                            </IonSelect>
                        </div>
                        <div className="info-tag">
                            <IonIcon icon={personOutline} />
                            <span>This user will be created based on your role hierarchy.</span>
                        </div>
                    </div>
                </div>

                {/* --- Profile Details --- */}
                <div className="modern-card">
                    <div className="card-accent-bar gold"></div>
                    <div className="card-inner">
                        <div className="card-top">
                            <IonIcon icon={personCircleOutline} className="accent-icon" />
                            <h3>Profile Details</h3>
                        </div>
                        <div className="floating-input">
                            <IonInput
                                label="Full Name*"
                                labelPlacement="stacked"
                                placeholder="John Doe"
                                fill="outline"
                                value={formData.fullName}
                                onIonInput={e => handleInputChange('fullName', e.detail.value!)}
                            />
                        </div>
                        <div className="floating-input">
                            <IonInput
                                label="Username*"
                                labelPlacement="stacked"
                                placeholder="@username"
                                fill="outline"
                                value={formData.username}
                                onIonInput={e => handleInputChange('username', e.detail.value!)}
                            />
                        </div>
                        <div className="input-row">
                            <div className="floating-input">
                                <IonInput
                                    type="password"
                                    label="Password*"
                                    labelPlacement="stacked"
                                    value={formData.password}
                                    fill="outline"
                                    onIonInput={e => handleInputChange('password', e.detail.value!)}
                                />
                            </div>
                            <div className="floating-input">
                                <IonInput
                                    label="Credit"
                                    labelPlacement="stacked"
                                    placeholder="0.00"
                                    fill="outline"
                                    type="number"
                                    min={0}
                                    value={formData.credit}
                                    onIonInput={e => handleInputChange('credit', e.detail.value!)}
                                />
                            </div>
                        </div>
                        {/* <div className="floating-input" style={{ marginTop: '10px' }}>
                            <IonInput
                                label="Contact Number"
                                labelPlacement="stacked"
                                placeholder="+91..."
                                fill="outline"
                                type="tel"
                                value={formData.contactNumber}
                                onIonInput={e => handleInputChange('contactNumber', e.detail.value!)}
                            />
                        </div> */}
                    </div>
                </div>

                {/* --- Exchange Access --- */}
                <div className="modern-card">
                    <div className="card-accent-bar"></div>
                    <div className="card-inner no-padding-sides">
                        <div className="card-top padded-header">
                            <IonIcon icon={globeOutline} className="accent-icon" />
                            <h3>Exchange Allow</h3>
                        </div>

                        <div className="exchange-table">
                            <div className="table-header">
                                <span className="col-ex">Exchange</span>
                                <span className="col-br">Brokerage</span>
                                <span className="col-gr">Group</span>
                            </div>
                            <div className="table-subheader">
                                <span></span>
                                <span>Turnover</span>
                                <span>Lot</span>
                                <span>Assign Group</span>
                            </div>

                            {exchanges.map((ex, i) => (
                                <div className="table-row" key={i}>
                                    <div className="col-ex cell">
                                        <IonCheckbox
                                            mode="md"
                                            checked={ex.enabled}
                                            onIonChange={e => handleExchangeChange(i, 'enabled', e.detail.checked)}
                                        />
                                        <span className="ex-text">{ex.name}</span>
                                    </div>
                                    <div className="col-br cell dual-check">
                                        <IonCheckbox
                                            mode="md"
                                            checked={ex.turnover}
                                            onIonChange={e => handleExchangeChange(i, 'turnover', e.detail.checked)}
                                        />
                                    </div>
                                    <div className="col-br cell dual-check">
                                        <IonCheckbox
                                            mode="md"
                                            checked={ex.lot}
                                            onIonChange={e => handleExchangeChange(i, 'lot', e.detail.checked)}
                                        />
                                    </div>
                                    <div className="col-gr cell">
                                        <IonSelect
                                            interface="popover"
                                            value={ex.group}
                                            toggleIcon={chevronDownOutline}
                                            onIonChange={e => {
                                                const selectedGroup = ex.groups.find((g: any) => g.name === e.detail.value);
                                                handleExchangeChange(i, 'group', e.detail.value);
                                                if (selectedGroup) {
                                                    handleExchangeChange(i, 'groupId', selectedGroup.id);
                                                }
                                            }}
                                        >
                                            {ex.groups && ex.groups.map((grp: any) => (
                                                <IonSelectOption key={grp.id} value={grp.name}>{grp.name}</IonSelectOption>
                                            ))}
                                            {(!ex.groups || ex.groups.length === 0) && (
                                                <IonSelectOption value="Default">Default</IonSelectOption>
                                            )}
                                        </IonSelect>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- High Low Section --- */}
                <div className="modern-card">
                    <div className="card-accent-bar gold"></div>
                    <div className="card-inner">
                        <div className="card-top">
                            <IonIcon icon={trendingUpOutline} className="accent-icon" />
                            <h3>High Low Between Trade Limit</h3>
                        </div>
                        <div className="select-all-box">
                            <IonCheckbox mode="md" />
                            <IonLabel>Select All Exchanges</IonLabel>
                        </div>
                    </div>
                </div>

                {/* --- Account Settings --- */}
                <div className="modern-card">
                    <div className="card-inner">
                        <div className="card-top">
                            <IonIcon icon={settingsOutline} className="accent-icon" />
                            <h3>Account Settings</h3>
                        </div>
                        <IonList lines="none" className="minimal-list">
                            <IonItem>
                                <IonIcon icon={addCircleOutline} slot="start" />
                                <IonLabel>Grant Master Access</IonLabel>
                                <IonToggle slot="end" mode="ios" />
                            </IonItem>
                            <IonItem>
                                <IonIcon icon={keyOutline} slot="start" />
                                <IonLabel>Force Password Reset</IonLabel>
                                <IonToggle slot="end" mode="ios" checked={true} />
                            </IonItem>
                        </IonList>
                    </div>
                </div>

                <div className="btn-container">
                    <IonButton
                        expand="block"
                        className="emperor-btn-luxury"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'CREATING...' : 'CONFIRM & CREATE USER'}
                    </IonButton>
                </div>

            </IonContent>
        </IonPage>
    );
};

export default CreateUser;