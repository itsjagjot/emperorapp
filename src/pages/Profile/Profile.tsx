import React from 'react';
import {
    IonContent, IonHeader, IonPage, IonToolbar, IonIcon, useIonRouter
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
    cubeOutline
} from 'ionicons/icons';
import './Profile.css';

const Profile: React.FC = () => {
    const router = useIonRouter();

    const handleLogout = () => {
        router.push('/login', 'root', 'replace');
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

    const sections = [
        // User Management: Only for Admins
        ...(isAdmin ? [{
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
                { title: 'Invite Friends', icon: peopleOutline, color: '#2c3e50', path: '/app/my-information/invite-friends' },
                { title: 'Login History', icon: documentTextOutline, color: '#2c3e50', path: '/app/my-information/login-history' },
                { title: 'Messages', icon: mailOutline, color: '#897e06ff', path: '/app/settings/message' },
            ]
        },

        // Reports
        {
            label: "Reports",
            items: [
                { title: 'Generate Bill', icon: receiptOutline, color: '#417505', path: '/app/reports/generate-bill' },
                { title: 'Weekly Admin', icon: calendarOutline, color: '#4a4a4a', path: '/app/reports/weekly-admin' },
                { title: 'Intraday History', icon: timeOutline, color: '#2e7d32', path: '/app/reports/intraday-history' },
                { title: 'P & L', icon: statsChartOutline, color: '#c62828', path: '/app/reports/pnl' },
                { title: 'Client P & L Summary', icon: barChartOutline, color: '#1565c0', path: '/app/reports/client-pnl' },
                { title: 'Script P & L Summary', icon: documentTextOutline, color: '#ef6c00', path: '/app/reports/script-pnl' },
                { title: 'Settlements Report', icon: scaleOutline, color: '#bb116cff', path: '/app/reports/settlement' },
                { title: 'Cf Margin SquareOff', icon: briefcaseOutline, color: '#590a7bff', path: '/app/reports/cf-margin' },
                { title: 'Userwise Open Position', icon: briefcaseOutline, color: '#0eca2aff', path: '/app/reports/userwise-open-position' },
                { title: '% Open Position', icon: pieChartOutline, color: '#1565c0', path: '/app/reports/open-position-percent' },
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
        },

        // Settings
        {
            label: "Settings",
            items: [
                { title: 'Market Timings', icon: timeOutline, color: '#7a0f38ff', path: '/app/settings/market-timing' },
                { title: 'Set Quantity Values', icon: settingsOutline, color: '#12a275ff', path: '/app/settings/quantity-value' },
                { title: 'Notification Settings', icon: notificationsOutline, color: '#be02cbff', path: '/app/settings/notification' },
                { title: 'Privacy Policy', icon: shieldCheckmarkOutline, color: '#52cc6aff', path: '/app/settings/privacy-policy' },
            ]
        }
    ];

    return (
        <IonPage className="profile-page">
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
                        {/* <button className="header-icon-btn">
                            <IonIcon icon={addOutline} />
                        </button> */}
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
                                    <div className="premium-card" key={iIdx} onClick={() => item.path && router.push(item.path)}>
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