import React from 'react';
import {
    IonContent, IonHeader, IonPage, IonToolbar, IonIcon, useIonRouter, useIonToast, isPlatform
} from '@ionic/react';
import {
    personAddOutline, listOutline, searchOutline, personOutline,
    walletOutline, receiptOutline, calendarOutline, chevronForwardOutline,
    addOutline, powerOutline, timeOutline, barChartOutline, statsChartOutline,
    documentTextOutline, scaleOutline, eyeOutline, settingsOutline,
    notificationsOutline, lockClosedOutline, fingerPrintOutline,
    mailOutline, peopleOutline, closeCircleOutline, trashOutline,
    shieldCheckmarkOutline, listCircleOutline,
    briefcaseOutline,
    pieChartOutline,
    alertCircleOutline,
    cubeOutline,
    globeOutline
} from 'ionicons/icons';
import { logoutUser } from '../../services/authService';
import Loader from '../../components/Loader/Loader';
import { ANDROID_INVITE_LINK, IOS_INVITE_LINK } from '../../services/config';
import './Profile.css';

const Profile: React.FC = () => {
    const [present] = useIonToast();
    const router = useIonRouter();
    const [loggingOut, setLoggingOut] = React.useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logoutUser();
            // Add a small delay so user can see the loader
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
        } catch (error) {
            console.error('Logout failed:', error);
            setLoggingOut(false);
        }
    };

    const handleInvite = async () => {
        let shareLink = '';

        if (isPlatform('android')) {
            shareLink = userData?.AndroidLink || ANDROID_INVITE_LINK;
        } else if (isPlatform('ios')) {
            shareLink = userData?.IOSLink || IOS_INVITE_LINK;
        } else {
            // Default for web/desktop
            shareLink = userData?.AndroidLink || ANDROID_INVITE_LINK;
        }

        const shareData = {
            title: 'Join Emperor Shot',
            text: 'Check out Emperor Shot for the best trading experience!',
            url: shareLink
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareData.url);
                present({
                    message: 'Link copied to clipboard!',
                    duration: 2000,
                    color: 'success',
                    position: 'bottom'
                });
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };


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

    // Derived state for role check
    const userRole = userData?.UserRoleName || '';
    const isAdmin = userRole === 'SuperAdmin' || userRole === 'Admin';

    const [isUnlocked, setIsUnlocked] = React.useState(localStorage.getItem('menuUnlocked') === 'true');
    React.useEffect(() => {
        const handleStorageChange = () => {
            setIsUnlocked(localStorage.getItem('menuUnlocked') === 'true');
        };
        window.addEventListener('menuUnlockedChanged', handleStorageChange);
        return () => window.removeEventListener('menuUnlockedChanged', handleStorageChange);
    }, []);

    const showAllFeatures = !isAdmin || isUnlocked;

    const sections = [
        // User Management: Only for Admins
        ...(isAdmin && showAllFeatures ? [{
            label: "User Management",
            items: [
                { title: 'Create New User', icon: personAddOutline, color: '#4a90e2', path: '/app/user-management/create' },
                { title: 'User List', icon: listOutline, color: '#f5a623', path: '/app/user-management/list' },
            ]
        }] : []),

        // My Information
        {
            label: "My Information",
            items: [
                { title: 'Profile', icon: personOutline, color: '#9013fe', path: '/app/my-information/profile' },
                { title: 'Account Summary', icon: walletOutline, color: '#d0021b', path: '/app/my-information/account-summary' },
                { title: 'Change Password', icon: lockClosedOutline, color: '#2c3e50', path: '/app/my-information/change-password' },
                { title: 'Invite Friends', icon: peopleOutline, color: '#2c3e50', action: handleInvite },
                { title: 'Login History', icon: documentTextOutline, color: '#2c3e50', path: '/app/my-information/login-history' },
                { title: 'Messages', icon: mailOutline, color: '#897e06ff', path: '/app/settings/message' },
            ].filter(item => showAllFeatures || ['Profile', 'Change Password', 'Login History', 'Messages'].includes(item.title))
        },

        // Reports
        ...(showAllFeatures ? [{
            label: "Reports",
            items: [
                { title: 'Generate Bill', icon: receiptOutline, color: '#417505', path: '/app/reports/generate-bill' },
                { title: 'Weekly Admin', icon: calendarOutline, color: '#4a4a4a', path: '/app/reports/weekly-admin' },
                { title: 'Intraday History', icon: timeOutline, color: '#2e7d32', path: '/app/reports/intraday-history' },
                { title: 'P & L', icon: statsChartOutline, color: '#c62828', path: '/app/reports/pnl' },
                // { title: 'Client P & L Summary', icon: barChartOutline, color: '#1565c0', path: '/app/reports/client-pnl' },
                // { title: 'Script P & L Summary', icon: documentTextOutline, color: '#ef6c00', path: '/app/reports/script-pnl' },
                { title: 'Settlements Report', icon: scaleOutline, color: '#bb116cff', path: '/app/reports/settlement' },
                // { title: 'Cf Margin SquareOff', icon: briefcaseOutline, color: '#590a7bff', path: '/app/reports/cf-margin' },
                { title: 'Userwise Open Position', icon: briefcaseOutline, color: '#0eca2aff', path: '/app/reports/userwise-open-position' },
                // { title: '% Open Position', icon: pieChartOutline, color: '#1565c0', path: '/app/reports/open-position-percent' },
                { title: 'Rejection Log', icon: alertCircleOutline, color: '#e1531fff', path: '/app/reports/rejection-log' },
                { title: 'Delete Trade', icon: trashOutline, color: '#ce0000ff', path: '/app/reports/delete-trade' },
                { title: 'Script Quantity', icon: cubeOutline, color: '#0ea985ff', path: '/app/reports/script-quantity' },
            ].filter(item => {
                if (isAdmin) return true;
                const allowed = [
                    'Generate Bill', 'Intraday History', 'Settlements Report',
                    'Cf Margin SquareOff', 'Rejection Log', 'Delete Trade', 'Script Quantity'
                ];
                return allowed.includes(item.title);
            })
        }] : []),

        // Settings
        {
            label: "Settings",
            items: [
                { title: 'Market Timings', icon: timeOutline, color: '#7a0f38ff', path: '/app/settings/market-timing' },
                { title: 'Set Quantity Values', icon: settingsOutline, color: '#12a275ff', path: '/app/settings/quantity-value' },
                { title: 'Notification Settings', icon: notificationsOutline, color: '#be02cbff', path: '/app/settings/notification' },
                { title: 'Privacy Policy', icon: shieldCheckmarkOutline, color: '#52cc6aff', path: '/app/settings/privacy-policy' },
            ].filter(item => showAllFeatures || ['Privacy Policy'].includes(item.title))
        }
    ].filter(section => section && section.items && section.items.length > 0);

    return (
        <IonPage className="profile-page">
            {loggingOut && <Loader overlay />}
            <IonHeader className="ion-no-border">
                <IonToolbar className="profile-nav">
                    <div className="profile-header-content">
                        <div className="user-brand">
                            <div className="logo-circle">
                                <img src="/assets/logo_icon.png" alt="E" />
                            </div>
                            <div className="brand-details">
                                <h2>{userData ? (userData.FirstName + ' ' + (userData.LastName || '')).trim() || userData.Username : 'User'}</h2>
                                <span>{userData?.UserRoleName || 'Member'}</span>
                            </div>
                        </div>
                        <button className="header-icon-btn logout-header-btn" onClick={handleLogout} title="Logout">
                            <IonIcon icon={powerOutline} />
                        </button>
                    </div>
                </IonToolbar>

            </IonHeader>

            <IonContent fullscreen className="profile-bg">
                <div className="profile-container">
                    {sections.map((section, sIdx) => (
                        <div key={sIdx} className="profile-section">
                            <h3 className="profile-section-label">{section.label}</h3>
                            <div className="card-stack">
                                {section.items.map((item: any, iIdx) => (
                                    <div className="premium-card" key={iIdx} onClick={() => {
                                        if (item.action) {
                                            item.action();
                                        } else if (item.path) {
                                            router.push(item.path);
                                        }
                                    }}>
                                        <div className="card-main">
                                            <div className="icon-wrapper" style={{ color: item.color }}>
                                                <IonIcon icon={item.icon} />
                                            </div>
                                            <span className="card-title">{item.title}</span>
                                        </div>
                                        <div className="arrow-box">
                                            <IonIcon icon={chevronForwardOutline} className="arrow-icon" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="logout-wrapper">
                        <button className="logout-action" onClick={handleLogout}>
                            <IonIcon icon={powerOutline} />
                            <span>Logout Account</span>
                        </button>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Profile;