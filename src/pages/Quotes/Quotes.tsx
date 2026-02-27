import React, { useState, useEffect } from 'react';
// import { liveRateService } from '../../services/LiveRate';
import { liveRateV2Service as liveRateService } from '../../services/ExiSoc/LiveRateV2';
import { SHOW_STRATEGY } from '../../services/config';
import { marketTimingService } from '../../services/MarketTimingService';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
    IonModal, IonIcon, IonGrid, IonRow, IonCol
} from '@ionic/react';
import { statsChartOutline, informationCircleOutline, listOutline, searchOutline } from 'ionicons/icons';
import './Quotes.css';
import OrderSheet from './OrderSheet/OrderSheet';
import Loader from '../../components/Loader/Loader';
import AddSymbolModal from './AddSymbol/AddSymbolModal';
import { useRateStore } from '../../store/useRateStore';

const Quotes: React.FC = () => {
    const [searchText, setSearchText] = useState('');
    const [quotes, setQuotes] = useState<any[]>([]);
    const [isAddSymbolOpen, setIsAddSymbolOpen] = useState(false);

    const userStr = localStorage.getItem('user');
    const userData = userStr ? JSON.parse(userStr) : null;
    const userRole = userData?.UserRoleName || '';
    const isAdmin = userRole === 'SuperAdmin' || userRole === 'Admin';
    const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

    // Load persisted selected symbols
    const [selectedSymbols, setSelectedSymbols] = useState<string[]>(() => {
        const saved = localStorage.getItem('selected_symbols');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { }
        }
        return [];
    });

    const handleSelectionChange = (newSelection: string[]) => {
        setSelectedSymbols(newSelection);
        localStorage.setItem('selected_symbols', JSON.stringify(newSelection));
    };

    const [isUnlocked, setIsUnlocked] = useState(localStorage.getItem('menuUnlocked') === 'true' || !isAdmin);

    useEffect(() => {
        const handleStorageChange = () => {
            setIsUnlocked(localStorage.getItem('menuUnlocked') === 'true' || !isAdmin);
        };
        window.addEventListener('menuUnlockedChanged', handleStorageChange);
        return () => window.removeEventListener('menuUnlockedChanged', handleStorageChange);
    }, []);

    // Store previous prices to determine fluctuation
    // Key: instrument + commodity + expiry
    const prevPricesRef = React.useRef<{ [key: string]: number }>({});
    const hasInitializedRef = React.useRef(false);

    const liveRates = useRateStore(state => state.rates);

    useEffect(() => {
        if (!liveRates || liveRates.length === 0) return;

        hasInitializedRef.current = true;

        // Deduplicate data based on SHOW_STRATEGY config
        const uniqueItems = new Map();
        liveRates.forEach((item: any) => {
            let commodity = item?.commodity ?? item?.symbol;
            // Determine key based on strategy
            const key = SHOW_STRATEGY === 'FCFS'
                ? commodity
                : `${item.instrument}-${commodity}-${item.expiry}`;

            if (SHOW_STRATEGY === 'FCFS') {
                const existing = uniqueItems.get(key);
                // Priority: Keep item if it has expiry data, or if no item exists yet
                if (!existing || (!existing.expiry && item.expiry)) {
                    uniqueItems.set(key, item);
                }
            } else {
                // Original logic for non-FCFS
                if (!uniqueItems.has(key)) {
                    uniqueItems.set(key, item);
                }
            }
        });

        const formattedQuotes = Array.from(uniqueItems.values()).map((item: any) => {
            let commodity = item?.commodity ?? item?.symbol;
            // Safety check for expiry_date to avoid substring errors
            let formattedDate = '';
            if (item.expiry && item.expiry.length >= 5) {
                const day = item.expiry.substring(0, 2);
                const month = item.expiry.substring(2, 5); // APR
                formattedDate = `${month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()} ${day}`;
            }

            const uniqueKey = `${item.instrument}-${commodity}-${item.expiry}`;
            const bidPrice = parseFloat(item.bid || item.ltp || '0');
            const askPrice = parseFloat(item.ask || item.close || item.ltp || '0');
            const currentPrice = bidPrice; // Using bid as the primary price for comparison
            const prevPrice = prevPricesRef.current[uniqueKey];

            let tickClass = '';
            if (prevPrice !== undefined) {
                const diff = Math.abs(currentPrice - prevPrice);
                if (diff >= 0.3) {
                    if (currentPrice > prevPrice) tickClass = 'tick-up high';
                    else if (currentPrice < prevPrice) tickClass = 'tick-down low';
                }
            }

            // Update ref with the primary price
            prevPricesRef.current[uniqueKey] = currentPrice;

            return {
                id: uniqueKey,
                name: `${commodity}${formattedDate ? ' ' + formattedDate : ''}`,
                price: bidPrice,
                high: parseFloat(item.high || '0'),
                low: parseFloat(item.low || '0'),
                change: parseFloat(item.change || '0'),
                changePercent: parseFloat(item.change_percent || '0'),
                open: parseFloat(item.open || '0'),
                close: askPrice,
                original: item,
                tickClass: tickClass
            };
        });
        setQuotes(formattedQuotes);
    }, [liveRates]);

    // ONLY show quotes that have been selected from the AddSymbolModal
    const watchListQuotes = quotes.filter(q => selectedSymbols.includes(q.id));
    const filteredQuotes = watchListQuotes.filter(q => q.name.toLowerCase().includes(searchText.toLowerCase()));

    // Keep selected quote state stable while modal is open
    const [selectedQuote, setSelectedQuote] = useState<any>(null);

    useEffect(() => {
        if (selectedQuoteId !== null) {
            const found = quotes.find(q => q.id === selectedQuoteId);
            if (found) {
                setSelectedQuote(found);
            }
        } else {
            setSelectedQuote(null);
        }
    }, [selectedQuoteId, quotes]);

    let pressTimer: any;
    const handlePressStart = () => {
        if (isAdmin && !isUnlocked) {
            pressTimer = setTimeout(() => {
                localStorage.setItem('menuUnlocked', 'true');
                setIsUnlocked(true);
                window.dispatchEvent(new Event('menuUnlockedChanged'));
                // Trigger tactile feedback mechanism if available
                if (navigator.vibrate) navigator.vibrate(200);
            }, 2500); // 2.5 seconds
        }
    };

    const handlePressEnd = () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
        }
    };

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar className="minimal-toolbar">
                    <IonTitle
                        onMouseDown={handlePressStart}
                        onMouseUp={handlePressEnd}
                        onMouseLeave={handlePressEnd}
                        onTouchStart={handlePressStart}
                        onTouchEnd={handlePressEnd}>
                        Marketwatch
                    </IonTitle>
                </IonToolbar>
                <div className="minimal-search-row">
                    <div className="search-input-container" onClick={() => setIsAddSymbolOpen(true)}>
                        <IonIcon icon={searchOutline} />
                        <input
                            placeholder="Search & Add"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            readOnly // Prevent keyboard pop-up, let it act as a button
                        />
                    </div>
                    <span className="count-badge">{filteredQuotes.length}/100</span>
                </div>
            </IonHeader>

            <IonContent className="white-content">
                {/* <div className="ticker-banner">
                <IonIcon icon={megaphoneOutline} className="megaphone" />
                <div className="marquee-wrapper">
                    <span className="marquee-text">Quotation. | NSE - SCRIPT - ONGC ME 6.25/- RS</span>
                </div>
            </div> */}

                {quotes.length === 0 ? (
                    <Loader />
                ) : (
                    <div className="minimal-list">
                        {filteredQuotes.map(quote => (
                            <div className="minimal-item" key={quote.id} onClick={() => {
                                if (!isUnlocked) return;
                                setSelectedQuoteId(quote.id);
                            }}>
                                <div className="item-row">
                                    <span className="item-name">{quote.name}</span>

                                    <div className="rate-container">
                                        <span className={`price-bid ${quote.tickClass}`}>{quote.price.toFixed(0)}</span>
                                        <span className={`price-ask ${quote.tickClass}`}>{quote.close.toFixed(0)}</span>
                                    </div>
                                </div>

                                <div className="item-row sub">
                                    <span className={quote.change >= 0 ? 'up' : 'down'}>
                                        {quote.change > 0 ? '+' : ''}{quote.change.toFixed(0)} {quote.changePercent != 0 ? '(' + quote.changePercent.toFixed(2) + '%)' : ''}
                                    </span>
                                    <span className="item-hl">L: {quote.low.toFixed(0)} H: {quote.high.toFixed(0)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <OrderSheet
                    quote={selectedQuote}
                    isOpen={!!selectedQuote}
                    onClose={() => setSelectedQuoteId(null)}
                    onSuccess={() => { /* Market data is live, no extra refresh needed here */ }}
                />

                <AddSymbolModal
                    isOpen={isAddSymbolOpen}
                    onClose={() => setIsAddSymbolOpen(false)}
                    availableQuotes={quotes}
                    selectedSymbols={selectedSymbols}
                    onSelectionChange={handleSelectionChange}
                />
            </IonContent>
        </IonPage>
    );
};

export default Quotes;