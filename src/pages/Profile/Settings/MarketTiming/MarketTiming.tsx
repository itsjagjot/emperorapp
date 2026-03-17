import React, { useState, useEffect } from 'react';
import {
    IonContent, IonPage, IonSelect, IonSelectOption, IonIcon, IonButton
} from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline, searchOutline } from 'ionicons/icons';
import CommonHeader from '../../../../components/CommonHeader';
import { marketTimingService, MarketTiming as MarketTimingData } from '../../../../services/MarketTimingService';
import Loader from '../../../../components/Loader/Loader';
import './MarketTiming.css';

const MarketTiming: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
    const [loading, setLoading] = useState(true);
    const [allTimings, setAllTimings] = useState<MarketTimingData[]>([]);

    const fetchAllTimings = async () => {
        setLoading(true);
        try {
            const data = await marketTimingService.getAllTimings();
            setAllTimings(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllTimings();

        const handleUpdate = (e: any) => {
            // Re-fetch or update local state
            fetchAllTimings();
        };

        window.addEventListener('market_timing_updated', handleUpdate);
        return () => {
            window.removeEventListener('market_timing_updated', handleUpdate);
        };
    }, []);

    const formatToAMPM = (timeStr: string) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        let h = parseInt(hours);
        const m = minutes;
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12; // the hour '0' should be '12'
        return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Helper to get timing for a specific day number
    const getDayTiming = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dayName = date.toLocaleString('en-US', { weekday: 'long' });
        return allTimings.find(t => t.day_name === dayName);
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDay(1);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDay(1);
    };

    // Current selected day info
    const selectedDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
    const dayLabel = selectedDateObj.toLocaleString('default', { weekday: 'short' }).toUpperCase();
    const currentDayTiming = getDayTiming(selectedDay);
    const isMarketOpen = currentDayTiming ? !currentDayTiming.is_closed : true;

    return (
        <IonPage>
            <CommonHeader title="Market Timing" />
            <IonContent className="admin-bg relative">
                {loading && <Loader overlay />}
                <div className="market-timing-wrapper">

                    <div className="filter-row">
                        <div className="filter-card flex-grow profile-card border-none">
                            <IonSelect value="MCX" interface="action-sheet" className="brand-select">
                                <IonSelectOption value="MCX">MCX</IonSelectOption>
                            </IonSelect>
                        </div>
                        <button className="btn-view-small theme-btn">
                            <IonIcon icon={searchOutline} />
                        </button>
                    </div>

                    <div className="calendar-card profile-card">
                        <div className="calendar-header-nav">
                            <IonButton fill="clear" onClick={handlePrevMonth} color="dark">
                                <IonIcon icon={chevronBackOutline} />
                            </IonButton>
                            <div className="current-month-display text-mono">{monthName} {year}</div>
                            <IonButton fill="clear" onClick={handleNextMonth} color="dark">
                                <IonIcon icon={chevronForwardOutline} />
                            </IonButton>
                        </div>

                        <div className="calendar-grid weekdays">
                            {weekdays.map((d, i) => <div key={i} className="grid-item head text-mono">{d}</div>)}
                        </div>

                        <div className="calendar-grid days">
                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                const dayTiming = getDayTiming(day);
                                const isClosed = dayTiming ? dayTiming.is_closed : false;
                                return (
                                    <div
                                        key={day}
                                        className={`grid-item ${selectedDay === day ? 'selected-day' : ''}`}
                                        onClick={() => setSelectedDay(day)}
                                    >
                                        <span className="day-num text-mono">{day}</span>
                                        <div className={`status-dot ${!isClosed ? 'open' : 'closed'}`}></div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="timing-footer">
                            <div className="date-box bg-muted">
                                <span className="day-label text-mono">{dayLabel}</span>
                                <span className="day-val font-bold">{selectedDay}</span>
                            </div>
                            <div className={`time-strip ${isMarketOpen ? 'bg-open' : 'bg-closed'}`}>
                                {isMarketOpen ? (
                                    currentDayTiming ? `${formatToAMPM(currentDayTiming.start_time)} - ${formatToAMPM(currentDayTiming.end_time)}` : '09:00 AM - 11:30 PM'
                                ) : '12:00 AM - 12:00 AM'}
                            </div>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default MarketTiming;