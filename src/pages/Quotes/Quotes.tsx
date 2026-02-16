import React, { useState, useEffect } from 'react';
import { liveRateService } from '../../services/LiveRate';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
    IonModal, IonIcon, IonGrid, IonRow, IonCol
} from '@ionic/react';
import { statsChartOutline, informationCircleOutline, listOutline, searchOutline } from 'ionicons/icons';
import './Quotes.css';
import OrderSheet from './OrderSheet/OrderSheet';

const Quotes: React.FC = () => {
    const [searchText, setSearchText] = useState('');
    const [quotes, setQuotes] = useState<any[]>([]);
    const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

    // Store previous prices to determine fluctuation
    // Key: instrument + commodity + expiry
    const prevPricesRef = React.useRef<{ [key: string]: number }>({});

    useEffect(() => {
        liveRateService.onMarketData((data) => {
            // Deduplicate data to prevent key warnings and ref collisions
            const uniqueItems = new Map();
            data.forEach((item: any) => {
                const uniqueKey = `${item.instrument}-${item.commodity}-${item.expiry_date}`;
                // Keep the last occurrence or first, doesn't matter much if they are identical.
                // Using set will keep the last one encountered.
                uniqueItems.set(uniqueKey, item);
            });

            const formattedQuotes = Array.from(uniqueItems.values()).map((item: any) => {
                // Format Date: 02APR2026 -> Apr 02
                const day = item.expiry_date.substring(0, 2);
                const month = item.expiry_date.substring(2, 5); // APR
                const formattedDate = `${month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()} ${day}`;

                const uniqueKey = `${item.instrument}-${item.commodity}-${item.expiry_date}`;
                const currentPrice = parseFloat(item.ltp);
                const prevPrice = prevPricesRef.current[uniqueKey];

                let tickClass = '';
                if (prevPrice !== undefined) {
                    if (currentPrice > prevPrice) tickClass = 'tick-up high';
                    else if (currentPrice < prevPrice) tickClass = 'tick-down low';
                }

                // Update ref
                prevPricesRef.current[uniqueKey] = currentPrice;

                return {
                    id: uniqueKey, // Using uniqueKey as ID for stability
                    name: `${item.commodity} ${formattedDate}`,
                    price: parseFloat(item.ltp),
                    high: parseFloat(item.high),
                    low: parseFloat(item.low),
                    change: parseFloat(item.abs_change),
                    changePercent: parseFloat(item.change_percent),
                    open: parseFloat(item.open), // Assuming data has open
                    close: parseFloat(item.close), // Assuming data has close
                    // Keep original for details if needed
                    original: item,
                    tickClass: tickClass
                };
            });
            setQuotes(formattedQuotes);
        });

        // Cleanup if needed? The service is a singleton so maybe just leave the callback?
        // Ideally we should have an unsubscribe, but the current implementation of onMarketData just replaces the callback.
        // So hitting other pages might stop this update, which is fine for now as we only need it here.
    }, []);

    const filteredQuotes = quotes.filter(q => q.name.toLowerCase().includes(searchText.toLowerCase()));

    // Derived state for the modal to ensure it gets live updates
    const selectedQuote = selectedQuoteId !== null ? quotes.find(q => q.id === selectedQuoteId) || null : null;

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar className="minimal-toolbar">
                    <IonTitle>Marketwatch</IonTitle>
                </IonToolbar>
                <div className="minimal-search-row">
                    <div className="search-input-container">
                        <IonIcon icon={searchOutline} />
                        <input
                            placeholder="Search & Add"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                    <span className="count-badge">{filteredQuotes.length}/100</span>
                </div>
            </IonHeader>

            <IonContent className="white-content">
                <div className="thin-alert">
                    UARGUM5 GUARSEED10 Old Contract settler
                </div>

                <div className="minimal-list">
                    {filteredQuotes.map(quote => (
                        <div className="minimal-item" key={quote.id} onClick={() => setSelectedQuoteId(quote.id)}>
                            <div className="item-row">
                                <span className="item-name">{quote.name}</span>

                                <div className="rate-container">
                                    {/* Using simple price for now as Bid/Ask are not in data sample explicitly, 
                                        using Price and Price+spread or just Price as per screenshot which shows one LTP mostly 
                                        but the code had bid/ask. 
                                        Screenshot has "150434.0 150599.0" -> likely Bid/Ask or LTP/Close?
                                        Actually the screenshot text "GOLD Apr 02" row has "150434.0  150599.0".
                                        The first black number is likely LTP. The second one?? 
                                        In previous code: price and price+165.
                                        
                                        Let's assume the data from socket is what we use.
                                        If we don't have separate Bid/Ask, we can just show LTP.
                                        BUT the screenshot shows TWO numbers on the right.
                                        The previous code had:
                                        <span className="price-bid">{quote.price.toFixed(1)}</span>
                                        <span className="price-ask">{(quote.price + 165).toFixed(1)}</span>
                                        
                                        Let's stick to showing LTP and maybe Close? Or just LTP if that's what's available.
                                        Ah, looking at the data: "ltp": "155346.00", "close": "155895.00".
                                        Maybe text is LTP and Close?
                                        Let's check the previous code again.
                                        It was hardcoded price and price+165.
                                        
                                        User said "menu liverate show krne".
                                        I will show LTP.
                                    */}
                                    <span className={`price-bid ${quote.tickClass}`}>{quote.price.toFixed(0)}</span>
                                    {/* <span className="price-ask">{(quote.price + 5).toFixed(0)}</span>  -- Placeholder spread if needed */}
                                    <span className={`price-ask ${quote.tickClass}`}>{quote.close.toFixed(0)}</span>
                                </div>
                            </div>

                            <div className="item-row sub">
                                <span className={quote.change >= 0 ? 'up' : 'down'}>
                                    {quote.change > 0 ? '+' : ''}{quote.change.toFixed(1)} ({quote.changePercent}%)
                                </span>
                                <span className="item-hl">L: {quote.low.toFixed(1)} H: {quote.high.toFixed(1)}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <OrderSheet
                    quote={selectedQuote}
                    isOpen={!!selectedQuote}
                    onClose={() => setSelectedQuoteId(null)}
                />
            </IonContent>
        </IonPage>
    );
};

export default Quotes;