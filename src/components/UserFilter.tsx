import React, { useState, useEffect } from 'react';
import { IonSelect, IonSelectOption } from '@ionic/react';
import { chevronDownOutline } from 'ionicons/icons';
import './UserFilter.css';
import userService from '../services/userService';

interface UserFilterProps {
    onUserChange: (userId: string) => void;
    includeSelf?: boolean;
    includeAll?: boolean;
    label?: string;
}

const UserFilter: React.FC<UserFilterProps> = ({
    onUserChange,
    includeSelf = false,
    includeAll = false,
    label = "All User"
}) => {
    const [selectedUser, setSelectedUser] = useState(includeAll ? 'all' : (includeSelf ? 'self' : ''));
    const [users, setUsers] = useState<{ user_id: number; user_name: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }

        const fetchUsers = async () => {
            try {
                const data = await userService.getAccessibleUsers();
                setUsers(data);

                // If only one user is available (current user), default to it if not including all/self
                if (data.length === 1 && !includeSelf && !includeAll) {
                    const userName = data[0].user_name;
                    setSelectedUser(userName);
                    onUserChange(userName);
                }
            } catch (error) {
                console.error('Failed to load users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleUserChange = (e: any) => {
        const val = e.detail.value;
        setSelectedUser(val);
        onUserChange(val);
    };

    if (!loading && users.length === 0 && !includeSelf && !includeAll) return null;

    // Filter users list to avoid showing current user twice if self option is present
    const displayedUsers = includeSelf && currentUser
        ? users.filter(u => u.user_name !== currentUser.Username)
        : users;

    return (
        <div className="user-filter-simple">
            <IonSelect
                value={selectedUser}
                placeholder={label}
                onIonChange={handleUserChange}
                interface="action-sheet"
                toggleIcon={chevronDownOutline}
                className="user-select-simple"
                disabled={loading}
            >
                {includeAll && <IonSelectOption value="all">All User</IonSelectOption>}
                {includeSelf && (
                    <IonSelectOption value="self">
                        Self {currentUser?.UserRoleName ? `(${currentUser.UserRoleName})` : ''}
                    </IonSelectOption>
                )}
                {displayedUsers.map(user => (
                    <IonSelectOption key={user.user_id} value={user.user_name}>
                        {user.name} ({user.user_name})
                    </IonSelectOption>
                ))}
            </IonSelect>
        </div>
    );
};

export default UserFilter;
