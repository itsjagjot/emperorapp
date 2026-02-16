import React from 'react';
import {
    IonContent, IonPage, IonIcon, useIonToast
} from '@ionic/react';
import { timeOutline, copyOutline, alertCircle, newspaper } from 'ionicons/icons';
import CommonHeader from '../../../../components/CommonHeader';
import './Message.css';

const Message: React.FC = () => {
    const [present] = useIonToast();

    const messages = [
        {
            id: 1,
            type: 'ban', // Red theme
            title: "Securities in Ban For Trade Date 06-FEB-2026",
            content: "SAMMAANCAP",
            time: "06 Feb 2026, 07:57 AM",
            icon: alertCircle
        },
        {
            id: 2,
            type: 'contract', // Blue theme
            title: "NEW CONTRACT Open",
            content: "NCDEX - \n\nCASTOR\nCOCUDAKL\nGUARGUM5\nGUARSEED10\n\nOld Contract settlement: 10-FEB-TUESDAY at last Quotation.",
            time: "05 Feb 2026, 03:39 PM",
            icon: newspaper
        }
    ];

    const doCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        present({ message: 'Copied!', duration: 800, color: 'dark', position: 'bottom' });
    };

    return (
        <IonPage>
            <CommonHeader title="Messages" />
            <IonContent className="admin-bg">
                <div className="modern-container">
                    {messages.map((m) => (
                        <div key={m.id} className={`pro-card ${m.type}`}>
                            {/* Top Strip */}
                            {/* <div className="card-accent"></div> */}

                            <div className="card-header">
                                <div className="time-group">
                                    <IonIcon icon={timeOutline} />
                                    <span>{m.time}</span>
                                </div>
                                <button className="copy-circle" onClick={() => doCopy(`${m.title}\n${m.content}`)}>
                                    <IonIcon icon={copyOutline} />
                                </button>
                            </div>

                            <div className="card-body">
                                <div className="title-row">
                                    <IonIcon icon={m.icon} className="status-icon" />
                                    <h2>{m.title}</h2>
                                </div>
                                <div className="content-area">
                                    <p>{m.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Message;