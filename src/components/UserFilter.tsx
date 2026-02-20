import React, { useState, useEffect } from 'react';
import { IonSelect, IonSelectOption, IonIcon } from '@ionic/react';
import { chevronDownOutline } from 'ionicons/icons';
import './UserFilter.css';

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

    useEffect(() => {
        onUserChange(selectedUser);
    }, []);

    // Dummy users - in real app, these would come from an API or global state
    const users = [
        { id: 'u1', name: 'John Doe' },
        { id: 'u2', name: 'Jane Smith' },
        { id: 'u3', name: 'Robert Wilson' },
    ];

    const handleUserChange = (e: any) => {
        const val = e.detail.value;
        setSelectedUser(val);
        onUserChange(val);
    };

    return (
        <div className="user-filter-simple">
            <IonSelect
                value={selectedUser}
                placeholder={label}
                onIonChange={handleUserChange}
                interface="action-sheet"
                toggleIcon={chevronDownOutline}
                className="user-select-simple"
            >
                {includeSelf && <IonSelectOption value="self">Self (SuperAdmin)</IonSelectOption>}
                {users.map(user => (
                    <IonSelectOption key={user.id} value={user.id}>
                        {user.name}
                    </IonSelectOption>
                ))}
            </IonSelect>
        </div>
    );
};

export default UserFilter;
