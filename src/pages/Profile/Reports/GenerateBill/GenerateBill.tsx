import React, { useState } from 'react';
import { IonContent, IonPage, IonIcon, IonButton, IonSelect, IonSelectOption, useIonViewWillEnter } from '@ionic/react';
import { chevronDownOutline, searchOutline, shareOutline } from 'ionicons/icons';
import Loader from '../../../../components/Loader/Loader';
import CommonHeader from '../../../../components/CommonHeader';
import DateFilter from '../../../../components/DateFilter';
import './GenerateBill.css';
import UserFilter from '../../../../components/UserFilter';
import TradeService, { TradeOrder } from '../../../../services/TradeService';
import TradeBill from './TradeBill';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

const GenerateBill: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<string>('self');
    const [selectedUserId, setSelectedUserId] = useState<string | number>('');
    const [billType, setBillType] = useState<string>('default');
    const [trades, setTrades] = useState<TradeOrder[]>([]);
    const [showReport, setShowReport] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Date range state
    const [dateRange, setDateRange] = useState<{ start: string | null, end: string | null }>({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useIonViewWillEnter(() => {
        // Reset state so user sees filters every time they navigate here
        setShowReport(false);
        setTrades([]);
    });

    React.useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }
    }, []);

    const handleSearch = async () => {
        setLoading(true);

        try {
            const allTrades = await TradeService.getOrders('Success', { user_id: selectedUserId });

            if (!allTrades || !Array.isArray(allTrades)) {
                setTrades([]);
                setShowReport(true);
                return;
            }

            // 2. Local Filtering
            let filtered = allTrades;

            // Filter by User
            if (selectedUser && selectedUser !== 'self') {
                filtered = filtered.filter(t =>
                    String(t.username).toLowerCase() === selectedUser.toLowerCase() ||
                    String(t.user_id) === selectedUser
                );
            }

            // Filter by Date Range
            if (dateRange.start && dateRange.end) {
                const startDate = new Date(dateRange.start);
                const endDate = new Date(dateRange.end);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);

                filtered = filtered.filter(t => {
                    if (!t.order_time) return false;
                    const tradeDate = new Date(t.order_time);
                    return tradeDate >= startDate && tradeDate <= endDate;
                });
            }

            setTrades(filtered);
            setShowReport(true);
            // Auto-trigger print after short delay to allow render
            setTimeout(() => {
                if (window.innerWidth > 768) { // Only on desktop/large screens usually
                    // window.print(); // Optional: Users might find this annoying if they just want to view
                }
            }, 500);
        } catch (error) {
            console.error('Failed to fetch trades', error);
            setTrades([]);
            setShowReport(true);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        const reportElement = document.querySelector('.bill-paper') as HTMLElement;
        if (!reportElement) return;

        setLoading(true);
        // Save original styles
        const originalStyle = reportElement.style.cssText;

        try {
            // Temporarily fix width and position for clean capture
            reportElement.style.width = '210mm';
            reportElement.style.position = 'absolute';
            reportElement.style.left = '0';
            reportElement.style.top = '0';
            reportElement.style.margin = '0';

            const canvas = await html2canvas(reportElement, {
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true,
                width: 794, // Approx 210mm in pixels at 96dpi
                windowWidth: 794
            });

            // Restore original styles
            reportElement.style.cssText = originalStyle;

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const displayUserName = selectedUser === 'self' ? (currentUser?.Username || 'Self') : selectedUser;
            const fileName = `Trade_Bill_${displayUserName}_${new Date().toISOString().split('T')[0]}.pdf`;

            if (Capacitor.isNativePlatform()) {
                const pdfBase64 = pdf.output('datauristring').split(',')[1];

                // Write file to Documents directory (Standard for mobile)
                const result = await Filesystem.writeFile({
                    path: fileName,
                    data: pdfBase64,
                    directory: Directory.Documents,
                    recursive: true
                });

                // Trigger native share sheet so user can save or send the PDF
                await Share.share({
                    title: 'Trade Bill',
                    text: 'Trade report PDF from Emperor App',
                    url: result.uri,
                });
            } else {
                pdf.save(fileName);
            }
        } catch (error) {
            console.error('Failed to generate or save PDF', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Trade Bill Report',
                    text: `Trade report for ${selectedUser}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing', error);
            }
        } else {
            handleDownloadPDF();
        }
    };

    return (
        <IonPage>
            <CommonHeader
                title={showReport ? "View Report" : "Generate PDF"}
                backLink={showReport ? undefined : "back()"}
                onBack={showReport ? () => setShowReport(false) : undefined}
                actionIcon={showReport ? shareOutline : undefined}
                onAction={showReport ? handleDownloadPDF : undefined}
            />

            <IonContent className={showReport ? "" : "ion-padding gray-bg relative"}>
                {loading && <Loader overlay />}
                {!showReport ? (
                    <div className="form-container">
                        <div className="mb-12">
                            <DateFilter onDateChange={(start, end) => setDateRange({ start, end })} />
                        </div>

                        <UserFilter
                            onUserChange={setSelectedUser}
                            onUserSelect={(u) => setSelectedUserId(u.user_id)}
                            includeSelf
                            defaultValue={selectedUser}
                            label="Select User"
                        />

                        <div className="action-row-compact">
                            <div className="user-filter-simple">
                                <IonSelect
                                    value={billType}
                                    placeholder="Default"
                                    onIonChange={(e: any) => setBillType(e.detail.value)}
                                    interface="action-sheet"
                                    toggleIcon={chevronDownOutline}
                                    className="user-select-simple"
                                >
                                    <IonSelectOption value="default">Default</IonSelectOption>
                                    {/* <IonSelectOption value="advance">Advance</IonSelectOption> */}
                                </IonSelect>
                            </div>
                            <IonButton
                                className="filter-box-btn"
                                onClick={handleSearch}
                                color="primary"
                            >
                                <IonIcon icon={searchOutline} />
                            </IonButton>
                        </div>
                    </div>
                ) : (
                    <div className="report-view-container">
                        <TradeBill
                            trades={trades}
                            userId={selectedUser === 'self' ? (currentUser?.Username || 'Self') : selectedUser}
                            startDate={dateRange.start || undefined}
                            endDate={dateRange.end || undefined}
                        />
                    </div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default GenerateBill;