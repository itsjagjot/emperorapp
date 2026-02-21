import { Redirect, Route } from 'react-router-dom';
import {
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
} from '@ionic/react';
import { barChartOutline, swapHorizontalOutline, briefcaseOutline, personOutline } from 'ionicons/icons';

import Quotes from '../Quotes/Quotes';
import Trade from '../Trade/Trade';
import Position from '../Position/Position';
import Profile from '../Profile/Profile';
import OrderDetails from '../Trade/OrderDetails';

// User Management Imports
import CreateUser from '../UserManagement/CreateUser/CreateUser';
import UserList from '../UserManagement/UserList/UserList';
import UserDetails from '../UserManagement/UserDetails/UserDetails';

// My Information Imports
import UserProfile from '../MyInformation/UserProfile/UserProfile';
import AccountSummary from '../MyInformation/AccountSummary/AccountSummary';
import ChangePassword from '../MyInformation/ChangePassword/ChangePassword';
import InviteFriends from '../MyInformation/InviteFriends/InviteFriends';
import LoginHistory from '../MyInformation/LoginHistory/LoginHistory';
import PrivacyPolicy from '../Profile/Settings/PrivacyPolicy/PrivacyPolicy';
import GenerateBill from '../Profile/Reports/GenerateBill/GenerateBill';
import WeeklyAdmin from '../Profile/Reports/WeeklyAdmin/WeeklyAdmin';
import IntradayHistory from '../Profile/Reports/IntradayHistory/IntradayHistory';
import SettlementsReport from '../Profile/Reports/Settlement/Settlement';
import PnL from '../Profile/Reports/PnL/PnL';
import ClientPnL from '../Profile/Reports/ClientPnL/ClientPnL';
import ScriptPnL from '../Profile/Reports/ScriptPnL/ScriptPnL';
import CfMargin from '../Profile/Reports/CfMargin/CfMargin';
import OpenPositionUserwise from '../Profile/Reports/OpenPositionUserwise/OpenPositionUserwise';
import OpenPositionPercent from '../Profile/Reports/OpenPositionPercent/OpenPositionPercent';
import RejectionLogHistory from '../Profile/Reports/RejectionLog/RejectionLog';
import DeleteTrade from '../Profile/Reports/DeleteTrade/DeleteTrade';
import ScriptQuantity from '../Profile/Reports/ScriptQuantity/ScriptQuantity';
import MarketTiming from '../Profile/Settings/MarketTiming/MarketTiming';
import QuantityValue from '../Profile/Settings/QuantityValue/QuantityValue';
import Message from '../Profile/Settings/Message/Message';
import Notification from '../Profile/Settings/Notification/Notification';

const TabsLayout: React.FC = () => {
    return (
        <IonTabs>
            <IonRouterOutlet>
                <Route exact path="/app/quotes">
                    <Quotes />
                </Route>
                <Route exact path="/app/trade">
                    <Trade />
                </Route>
                <Route exact path="/app/position">
                    <Position />
                </Route>
                <Route exact path="/app/profile">
                    <Profile />
                </Route>
                <Route exact path="/app/trade/details/:id" component={OrderDetails} />

                {/* User Management Routes */}
                <Route exact path="/app/user-management/create" component={CreateUser} />
                <Route exact path="/app/user-management/list" component={UserList} />
                <Route exact path="/app/user-management/details/:id" component={UserDetails} />

                {/* My Information Routes */}
                <Route exact path="/app/my-information/profile" component={UserProfile} />
                <Route exact path="/app/my-information/account-summary" component={AccountSummary} />
                <Route exact path="/app/my-information/change-password" component={ChangePassword} />
                <Route exact path="/app/my-information/invite-friends" component={InviteFriends} />
                <Route exact path="/app/my-information/login-history" component={LoginHistory} />

                {/* Reports Routes */}
                <Route exact path="/app/reports/generate-bill" component={GenerateBill} />
                <Route exact path="/app/reports/weekly-admin" component={WeeklyAdmin} />
                <Route exact path="/app/reports/intraday-history" component={IntradayHistory} />
                <Route exact path="/app/reports/pnl" component={PnL} />
                <Route exact path="/app/reports/client-pnl" component={ClientPnL} />
                <Route exact path="/app/reports/script-pnl" component={ScriptPnL} />
                <Route exact path="/app/reports/settlement" component={SettlementsReport} />
                <Route exact path="/app/reports/cf-margin" component={CfMargin} />
                <Route exact path="/app/reports/userwise-open-position" component={OpenPositionUserwise} />
                <Route exact path="/app/reports/open-position-percent" component={OpenPositionPercent} />
                <Route exact path="/app/reports/rejection-log" component={RejectionLogHistory} />
                <Route exact path="/app/reports/delete-trade" component={DeleteTrade} />
                <Route exact path="/app/reports/script-quantity" component={ScriptQuantity} />

                {/* Settings Routes */}
                <Route exact path="/app/settings/market-timing" component={MarketTiming} />
                <Route exact path="/app/settings/quantity-value" component={QuantityValue} />
                <Route exact path="/app/settings/message" component={Message} />
                <Route exact path="/app/settings/notification" component={Notification} />
                <Route exact path="/app/settings/privacy-policy" component={PrivacyPolicy} />

                <Route exact path="/app">
                    <Redirect to="/app/quotes" />
                </Route>
            </IonRouterOutlet>

            <IonTabBar slot="bottom" color="light">
                <IonTabButton tab="quotes" href="/app/quotes">
                    <IonIcon icon={barChartOutline} />
                    <IonLabel>Quotes</IonLabel>
                </IonTabButton>
                <IonTabButton tab="trade" href="/app/trade">
                    <IonIcon icon={swapHorizontalOutline} />
                    <IonLabel>Trade</IonLabel>
                </IonTabButton>
                <IonTabButton tab="position" href="/app/position">
                    <IonIcon icon={briefcaseOutline} />
                    <IonLabel>Position</IonLabel>
                </IonTabButton>
                <IonTabButton tab="profile" href="/app/profile">
                    <IonIcon icon={personOutline} />
                    <IonLabel>Profile</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    );
};

export default TabsLayout;
