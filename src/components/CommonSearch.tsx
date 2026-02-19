import React from 'react';
import { IonIcon } from '@ionic/react';
import { searchOutline } from 'ionicons/icons';
import './CommonSearch.css';

interface CommonSearchProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

const CommonSearch: React.FC<CommonSearchProps> = ({ value, onChange, placeholder = "Search..." }) => {
    return (
        <div className="common-search-wrapper">
            <div className="search-inner">
                <IonIcon icon={searchOutline} className="search-icon" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
};

export default CommonSearch;
