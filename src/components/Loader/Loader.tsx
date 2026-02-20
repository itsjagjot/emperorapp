import React from 'react';
import './Loader.css';

interface LoaderProps {
    overlay?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ overlay }) => {
    return (
        <div className={`loader-container ${overlay ? 'overlay' : ''}`}>
            <div className="loader"></div>
        </div>
    );
};

export default Loader;
