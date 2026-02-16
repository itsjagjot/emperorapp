import { Redirect, Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import Login from '../pages/Auth/Login';
import TabsLayout from '../pages/Tabs/TabsLayout';

const AppRoutes: React.FC = () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    return (
        <IonRouterOutlet>
            <Route path="/login" component={Login} exact={true} />
            <Route path="/app" render={() => isAuthenticated ? <TabsLayout /> : <Redirect to="/login" />} />
            <Route exact path="/" render={() => <Redirect to={isAuthenticated ? "/app/quotes" : "/login"} />} />
        </IonRouterOutlet>
    );
};

export default AppRoutes;
