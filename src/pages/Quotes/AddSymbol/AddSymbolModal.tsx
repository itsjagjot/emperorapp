import React, { useState, useMemo } from 'react';
import {
    IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
    IonIcon, IonSearchbar, IonList, IonItem, IonLabel, IonCheckbox, IonButton,
    IonButtons
} from '@ionic/react';
import { arrowBackOutline, refreshOutline, chevronForwardOutline, closeOutline, searchOutline } from 'ionicons/icons';
import './AddSymbolModal.css';
import { SHOW_STRATEGY } from '../../../services/config';

interface AddSymbolModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableQuotes: any[]; // The full unstructured list of quotes from socket
    selectedSymbols: string[];
    onSelectionChange: (selected: string[]) => void;
}

const AddSymbolModal: React.FC<AddSymbolModalProps> = ({
    isOpen, onClose, availableQuotes, selectedSymbols, onSelectionChange
}) => {
    // view can be 'exchanges' or 'symbols'
    const [view, setView] = useState<'exchanges' | 'symbols'>('exchanges');
    const [selectedExchange, setSelectedExchange] = useState<string>('');
    const [searchText, setSearchText] = useState('');

    const handleBack = () => {
        if (view === 'symbols') {
            setView('exchanges');
            setSearchText('');
        } else {
            onClose();
        }
    };

    // Calculate quote groups based on exchange (Instrument)
    // For now, most MCX will have instrument 'FUTCOM' or similar. We'll simulate the exchanges shown in image.
    // Realistically, everything coming might be MCX right now, so we group them.
    const groupedQuotes = useMemo(() => {
        const groups: Record<string, any[]> = {
            'MCX': [],
        };

        availableQuotes.forEach(quote => {
            const inst = (quote.original?.instrument || '').toUpperCase();
            // Basic grouping logic for mock, everything will fall to MCX if we don't know it,
            // or we just map FUTCOM to MCX
            if (inst.includes('FUTCOM') || inst.includes('MCX')) {
                groups['MCX'].push(quote);
            } else if (inst.includes('FUTIDX') || inst.includes('OPTIDX')) {
                groups['NSE'].push(quote);
            } else {
                groups['MCX'].push(quote); // Defaulting to MCX for now as requested
            }
        });

        // Deduplicate within MCX group to show only unique quotes like in Quote list
        Object.keys(groups).forEach(key => {
            const unique = new Map();
            groups[key].forEach(q => unique.set(q.id, q));
            groups[key] = Array.from(unique.values());
        });

        return groups;
    }, [availableQuotes]);


    const currentList = useMemo(() => {
        if (view === 'exchanges') {
            return Object.keys(groupedQuotes).filter(key => key.toLowerCase().includes(searchText.toLowerCase()));
        } else {
            return groupedQuotes[selectedExchange]?.filter(q => q.name.toLowerCase().includes(searchText.toLowerCase())) || [];
        }
    }, [view, groupedQuotes, selectedExchange, searchText]);

    const totalCurrentCount = view === 'exchanges' ? 4390 : groupedQuotes[selectedExchange]?.length || 0; // Fake total count for aesthetics
    const displayTotalCount = view === 'exchanges' ? 4390 : totalCurrentCount;


    const handleExchangeClick = (exchange: string) => {
        if (exchange === 'MCX') {
            setSelectedExchange(exchange);
            setView('symbols');
            setSearchText('');
        }
    };

    const toggleSelection = (quoteId: string) => {
        const isSelected = selectedSymbols.includes(quoteId);
        let newSelection = [];
        if (isSelected) {
            newSelection = selectedSymbols.filter(id => id !== quoteId);
        } else {
            newSelection = [...selectedSymbols, quoteId];
        }
        onSelectionChange(newSelection);
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose} className="add-symbol-modal">
            <IonHeader className="ion-no-border add-sym-header">
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={handleBack} className="back-btn">
                            <IonIcon icon={arrowBackOutline} />
                        </IonButton>
                    </IonButtons>
                    <IonTitle className="sym-title">
                        {view === 'exchanges' ? 'Add Symbol' : selectedExchange}
                    </IonTitle>
                    <IonButtons slot="end">
                        <IonButton className="refresh-btn">
                            <IonIcon icon={refreshOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
                <div className="sym-search-row">
                    <div className="sym-search-box">
                        <IonIcon icon={searchOutline} className="s-icon" />
                        <input
                            type="text"
                            placeholder="Search & Add"
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                        />
                        <div className="s-counts">
                            <span className="count-num">
                                {currentList.length}/{view === 'exchanges' ? '4390' : displayTotalCount}
                            </span>
                            <IonIcon
                                icon={closeOutline}
                                className="clear-icon"
                                onClick={() => setSearchText('')}
                                style={{ display: searchText ? 'block' : 'none' }}
                            />
                        </div>
                    </div>
                </div>
            </IonHeader>

            <IonContent className="sym-content">
                <IonList className="sym-list lines-none">
                    {view === 'exchanges' && currentList.map(exchange => (
                        <IonItem key={exchange} className="sym-item group-item" button onClick={() => handleExchangeClick(exchange as string)}>
                            <IonLabel className="group-name">{exchange}</IonLabel>
                            <span className="group-count">({groupedQuotes[exchange as string].length})</span>
                            <IonIcon icon={chevronForwardOutline} slot="end" className="group-arrow" />
                        </IonItem>
                    ))}

                    {view === 'symbols' && currentList.map((quote: any) => {
                        const isSelected = selectedSymbols.includes(quote.id);
                        const mappedLot = quote.original?.lot_size || 100;

                        return (
                            <IonItem key={quote.id} className="sym-item child-item">
                                <div slot="start" className="checkbox-wrapper" onClick={() => toggleSelection(quote.id)}>
                                    <div className={`custom-checkbox ${isSelected ? 'checked' : ''}`}>
                                        {isSelected && (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="check-icon">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <IonLabel>
                                    <h2 className="sym-name">{quote.original?.commodity || quote.symbol || quote.name.split(' ')[0]}</h2>
                                    <p className="sym-sub">
                                        MCX {quote.name.replace(quote.original?.commodity || quote.name.split(' ')[0], '').trim() || quote.original?.expiry || ''}
                                    </p>
                                    <p className="sym-meta">
                                        Max: 0.0 Breakup: 0.0 Lotsize: {mappedLot}.0
                                    </p>
                                </IonLabel>
                                <IonIcon icon={chevronForwardOutline} slot="end" className="group-arrow" />
                            </IonItem>
                        );
                    })}
                </IonList>
            </IonContent>
        </IonModal>
    );
};

export default AddSymbolModal;
