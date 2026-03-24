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
import autoTable from 'jspdf-autotable';
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
            const allTrades = await TradeService.getOrders('Success', {
                user_id: selectedUserId,
                fromDate: dateRange.start,
                toDate: dateRange.end
            });

            if (!allTrades || !Array.isArray(allTrades)) {
                setTrades([]);
                setShowReport(true);
                return;
            }

            // 2. Local Filtering
            let filtered = allTrades;

            // Filter by User
            if (selectedUser && selectedUser !== 'self' && selectedUser !== 'all') {
                filtered = filtered.filter(t =>
                    String(t.username).toLowerCase() === selectedUser.toLowerCase() ||
                    String(t.user_id) === String(selectedUser)
                );
            }

            // Filter by Date Range (Handled by API now, keeping as safety fallback for local state consistency)
            if (dateRange.start && dateRange.end && (!allTrades || allTrades.length > 500)) { // Only if a fallback is needed
                // ... logic can be kept but we'll prioritize API result
            }
            // Actually, let's just trust the API for dates now to avoid redundant compute

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

    const handleDownloadPDF = async () => {
        const reportElement = document.querySelector('.bill-paper') as HTMLElement;
        if (!reportElement) return;

        setLoading(true);
        // Save original styles
        const originalStyle = reportElement.style.cssText;

        try {
            // Force A4 dimensions for clean capture
            reportElement.style.width = '210mm';
            reportElement.style.position = 'absolute';
            reportElement.style.left = '0';
            reportElement.style.top = '0';
            reportElement.style.margin = '0';
            reportElement.style.boxShadow = 'none';

            const canvas = await html2canvas(reportElement, {
                scale: 2, // Double resolution for clear PDF
                logging: false,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: 794, // Approx 210mm in pixels at 96dpi
                windowWidth: 794,
            });

            // Restore original styles
            reportElement.style.cssText = originalStyle;

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = 210;
            const pageHeight = 297;
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add extra pages if report is long
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const displayUserName = selectedUser === 'self' ? (currentUser?.Username || 'Self') : selectedUser;
            const fileName = `Trade_Bill_${displayUserName}.pdf`;

            if (Capacitor.isNativePlatform()) {
                const pdfBase64 = pdf.output('datauristring').split(',')[1];
                const result = await Filesystem.writeFile({
                    path: fileName,
                    data: pdfBase64,
                    directory: Directory.Cache,
                    recursive: true
                });

                await Share.share({
                    title: 'Trade Bill',
                    url: result.uri,
                });
            } else {
                pdf.save(fileName);
            }
        } catch (error) {
            console.error('Failed to generate PDF:', error);
        } finally {
            setLoading(false);
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
                            value={selectedUser}
                            onUserChange={setSelectedUser}
                            onUserSelect={(u) => setSelectedUserId(u.user_id)}
                            includeSelf
                            includeAll
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
                            userId={selectedUser === 'all' ? 'ALL USERS SUMMARY' : (selectedUser === 'self' ? (currentUser?.Username || 'Self') : selectedUser)}
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