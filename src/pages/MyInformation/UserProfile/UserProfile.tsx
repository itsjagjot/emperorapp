import React from 'react';
import {
    IonContent,
    IonPage,
    IonIcon,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonRippleEffect
} from '@ionic/react';
import {
    person,
    card,
    wallet,
    phonePortrait,
    informationCircle,
    trash,
    chevronForwardOutline,
    idCard
} from 'ionicons/icons';
import CommonHeader from '../../../components/CommonHeader';
import './UserProfile.css';

const UserProfile: React.FC = () => {
    const [userData, setUserData] = React.useState<any>(null);

    React.useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserData(user);
            } catch (e) {
                console.error("Error parsing user data");
            }
        }
    }, []);

    const getInitials = (firstName: string, lastName: string) => {
        return ((firstName?.charAt(0) || '') + (lastName?.charAt(0) || '')).toUpperCase() || 'U';
    };
    return (
        <IonPage className="user-profile-page">
            <CommonHeader title="Profile Information" />
            <IonContent className="ion-padding custom-body-bg">

                {/* Profile Section (Keep your current horizontal layout) */}
                <div className="profile-hero-layout">
                    <div className="avatar-box-wrapper">
                        <div className="avatar-main">{userData ? getInitials(userData.FirstName, userData.LastName) : 'HR'}</div>
                        <div className={`status-dot ${userData?.IsActive ? '' : 'offline'}`}></div>
                    </div>
                    <div className="hero-info">
                        <h2>{userData ? (userData.FirstName + ' ' + (userData.LastName || '')).trim() || userData.Username : 'User'}</h2>
                        <span className="active-tag">● {userData?.IsActive ? 'ACTIVE MEMBER' : 'INACTIVE'}</span>
                    </div>
                </div>

                {/* Stats Cards - Clean Floating Style */}
                <div className="stats-container">
                    <div className="stat-pill">
                        <div className="stat-icon-bg green-tint">
                            <IonIcon icon={card} />
                        </div>
                        <div className="stat-content">
                            <label>Credit Limit</label>
                            <p>{userData?.Credit ? userData.Credit.toLocaleString('en-IN') : '0'}</p>
                        </div>
                    </div>
                    <div className="stat-pill">
                        <div className="stat-icon-bg red-tint">
                            <IonIcon icon={wallet} />
                        </div>
                        <div className="stat-content">
                            <label>Available Balance</label>
                            <p>{userData?.Credit ? userData.Credit.toLocaleString('en-IN') : '0'}</p>
                        </div>
                    </div>
                </div>

                {/* Unified Details Card (Professional List) */}
                <h3 className="section-heading">Personal Details</h3>
                <div className="unified-settings-card">
                    {[
                        { label: 'Full Name', value: userData ? (userData.FirstName + ' ' + (userData.LastName || '')).trim() : 'N/A', icon: person, color: '#3b82f6' },
                        { label: 'Username', value: userData?.Username || 'N/A', icon: idCard, color: '#f97316' },
                        { label: 'Contact', value: userData?.ContactNumber || 'N/A', icon: phonePortrait, color: '#10b981' },
                        { label: 'App Version', value: '1.0.0', icon: informationCircle, color: '#8b5cf6' },
                    ].map((item, index) => (
                        <div className="settings-row" key={index}>
                            <div className="settings-icon" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                                <IonIcon icon={item.icon} />
                            </div>
                            <div className="settings-text">
                                <label>{item.label}</label>
                                <p>{item.value}</p>
                            </div>
                            {index < 3 && <div className="settings-divider" />}
                        </div>
                    ))}
                </div>

                {/* Minimalist Delete Action */}
                <div className="footer-action">
                    <button className="minimal-delete-btn">
                        <IonIcon icon={trash} />
                        <span>Delete Account</span>
                    </button>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default UserProfile;