import React, { useState, useEffect, useCallback } from 'react';
import {
    IonContent,
    IonPage,
    IonSearchbar,
    IonIcon,
    IonBadge,
    IonGrid,
    IonRow,
    IonCol,
    useIonViewWillEnter,
    useIonToast
} from '@ionic/react';
import { funnel } from 'ionicons/icons';
import CommonHeader from '../../../components/CommonHeader';
import Loader from '../../../components/Loader/Loader';
import { API_BASE_URL } from '../../../services/config';
import './UserList.css';
import CommonSearch from '../../../components/CommonSearch';

interface User {
    UserId: number;
    Username: string;
    FirstName: string;
    LastName: string;
    UserRoleName: string;
    IsActive: boolean;
    Credit: number;
    // Add placeholders if needed
    balance?: string;
    pl?: string;
}

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchText, setSearchText] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [present] = useIonToast();

    const fetchUsers = useCallback(async (search: string = '', pageNum: number = 1, showLoader: boolean = true) => {
        if (showLoader) setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const url = `${API_BASE_URL}/User?page=${pageNum}&pageSize=50&search=${encodeURIComponent(search)}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                // result format: { Meta: {...}, Data: [...] }
                if (result.Data) {
                    setUsers(result.Data);
                    if (result.Meta) {
                        setTotalPages(result.Meta.TotalPages);
                    }
                } else if (Array.isArray(result)) {
                    // Fallback for direct array
                    setUsers(result);
                }
            } else {
                console.error('Failed to fetch users');
                present('Failed to fetch user list', 2000);
            }
        } catch (error) {
            console.error(error);
            present('Network error', 2000);
        } finally {
            if (showLoader) setLoading(false);
        }
    }, [present]);

    useIonViewWillEnter(() => {
        fetchUsers(searchText, 1, true);
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchText.length > 0 || searchText === '') {
                fetchUsers(searchText, 1, false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText, fetchUsers]);

    const handleSearchChange = (e: CustomEvent) => {
        setSearchText(e.detail.value!);
    };

    return (
        <IonPage className="user-list-page">
            <CommonHeader title="User List" />

            <IonContent className="ion-padding relative">
                {loading && <Loader />}

                {/* Search and Filter Section */}
                <div className="action-row-compact">
                    {/* <IonSearchbar placeholder="Search users..." className="custom-searchbar"></IonSearchbar> */}
                    <CommonSearch
                        value={searchText}
                        onChange={setSearchText}
                        placeholder="Search users..."
                    />
                    <div className="filter-box">
                        <IonIcon icon={funnel} />
                    </div>
                </div>

                <div className="stats-row">
                    <span>Total Users: {users.length}</span>{/* Actually should come from Meta.TotalRecords */}
                    <span>Showing {users.length} results</span>
                </div>

                {/* Mapping Users to Cards */}
                {users.length === 0 && !loading && (
                    <div className="no-data">No users found.</div>
                )}

                {users.map((user) => (
                    <div className="user-card" key={user.UserId}>
                        <div className="card-header">
                            <div className="user-info">
                                <div className="avatar-circle">
                                    {user.FirstName ? user.FirstName.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="name-section">
                                    <h3>{user.FirstName} {user.LastName}</h3>
                                    <p>@{user.Username} ({user.UserRoleName})</p>
                                </div>
                            </div>
                            <IonBadge color={user.IsActive ? 'success' : 'medium'} className="status-badge">
                                {user.IsActive ? 'Active' : 'Inactive'}
                            </IonBadge>
                        </div>

                        <IonGrid className="card-details">
                            <IonRow>
                                <IonCol size="4" className="detail-col border-right">
                                    <p className="label">Balance</p>
                                    {/* Placeholder logic for Balance */}
                                    <p className={`value ${'0' === '0' ? 'red' : ''}`}>0</p>
                                </IonCol>
                                <IonCol size="4" className="detail-col border-right">
                                    <p className="label">Credit</p>
                                    <p className="value green">{user.Credit}</p>
                                </IonCol>
                                <IonCol size="4" className="detail-col">
                                    <p className="label">PL Sharing</p>
                                    <p className="value red">0.0%</p>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </div>
                ))}
            </IonContent>
        </IonPage>
    );
};

export default UserList;