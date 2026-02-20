import React, { useState, useEffect } from 'react';
import { IonSelect, IonSelectOption } from '@ionic/react';
import { chevronDownOutline } from 'ionicons/icons';
import './UserFilter.css';
import userService from '../services/userService';

interface UserFilterProps {
    onUserChange: (userId: string) => void;
    includeSelf?: boolean;
    label?: string;
}

const UserFilter: React.FC<UserFilterProps> = ({
    onUserChange,
    includeSelf = false,
    label = "All User"
}) => {
    const [selectedUser, setSelectedUser] = useState(includeSelf ? 'self' : '');
    const [users, setUsers] = useState<{ user_id: number; user_name: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await userService.getAccessibleUsers();
                setUsers(data);

                // If only one user is returned (self), we might want to default to that
                // or if current user is not Admin/SuperAdmin, just show self.
                if (data.length === 1 && !includeSelf) {
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

    if (!loading && users.length === 0 && !includeSelf) return null;

    // Hide filter if only one user is available (meaning current user is a regular user or has no sub-users)
    if (!loading && users.length <= 1) {
        return null;
    }

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
                {includeSelf && <IonSelectOption value="self">Self (SuperAdmin)</IonSelectOption>}
                {users.map(user => (
                    <IonSelectOption key={user.user_id} value={user.user_name}>
                        {user.name} ({user.user_name})
                    </IonSelectOption>
                ))}
            </IonSelect>
        </div>
    );
};

export default UserFilter;
