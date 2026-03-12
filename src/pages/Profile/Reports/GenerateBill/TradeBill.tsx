
import React from 'react';
import './TradeBill.css';
import { TradeOrder } from '../../../../services/TradeService';

interface TradeBillProps {
    trades: TradeOrder[];
    userId: string;
    startDate?: string;
    endDate?: string;
}

const TradeBill: React.FC<TradeBillProps> = ({ trades, userId, startDate, endDate }) => {
    if (!trades || trades.length === 0) {
        return (
            <div className="trade-bill-container">
                <div className="bill-paper">
                    <div className="bill-header">
                        <h2>{userId || 'CLIENT REPORT'}</h2>
                        <p>General Summary From {startDate || '-'} To {endDate || '-'}</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        <h3>No trade records found for this period.</h3>
                    </div>
                </div>
            </div>
        );
    }

    // Separate trades into settled and running
    const settledTrades = trades.filter(t => !t.is_running);
    const runningTrades = trades.filter(t => t.is_running);

    // Group settled trades by script name for the main report
    const groupedTrades = settledTrades.reduce((acc: any, trade) => {
        if (!acc[trade.name]) {
            acc[trade.name] = [];
        }
        acc[trade.name].push(trade);
        return acc;
    }, {});

    const scripts = Object.keys(groupedTrades);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(val);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleString('en-GB', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        });
    };

    const getColorClass = (val: number) => {
        if (val > 0) return 'text-success';
        if (val < 0) return 'text-danger';
        return '';
    };

    let totalNetPL = 0;
    let totalBrokerage = 0;

    return (
        <div className="trade-bill-viewer">
            <div className="bill-paper">
                <div className="bill-header">
                    <h2>{userId || 'CLIENT REPORT'}</h2>
                    <p>General Summary From {startDate || '-'} To {endDate || '-'}</p>
                </div>

                {scripts.map(scriptName => {
                    const scriptTrades = groupedTrades[scriptName];
                    const buyTrades = scriptTrades.filter((t: any) => t.action.toLowerCase() === 'buy');
                    const sellTrades = scriptTrades.filter((t: any) => t.action.toLowerCase() === 'sell');

                    const totalBQty = buyTrades.reduce((sum: number, t: any) => sum + Number(t.quantity), 0);
                    const totalBVol = buyTrades.reduce((sum: number, t: any) => sum + (Number(t.quantity) * Number(t.price) * (Number(t.lot_size) || 1) / 100), 0);
                    const avgBPrice = totalBQty > 0 ? totalBVol / (totalBQty * (Number(scriptTrades[0].lot_size) || 1) / 100) : 0;

                    const totalSQty = sellTrades.reduce((sum: number, t: any) => sum + Number(t.quantity), 0);
                    const totalSVol = sellTrades.reduce((sum: number, t: any) => sum + (Number(t.quantity) * Number(t.price) * (Number(t.lot_size) || 1) / 100), 0);
                    const avgSPrice = totalSQty > 0 ? totalSVol / (totalSQty * (Number(scriptTrades[0].lot_size) || 1) / 100) : 0;

                    const scriptNetVol = totalSVol - totalBVol;
                    const scriptBrk = scriptTrades.reduce((sum: number, t: any) => sum + Number(t.brokerage_amount || 0), 0) / 100;
                    const scriptNetResult = scriptNetVol - scriptBrk;

                    totalNetPL += scriptNetVol;
                    totalBrokerage += scriptBrk;

                    return (
                        <div key={scriptName} className="script-section">
                            <div className="script-name-header">{scriptName}</div>

                            <div className="tables-row">
                                {/* Buy Table */}
                                <div className="side-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th className="ion-text-right">B Qty</th>
                                                <th className="ion-text-right">Price</th>
                                                <th className="ion-text-right">B Vol.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {buyTrades.map((t: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td>{formatDate(t.order_time)}</td>
                                                    <td className="ion-text-right">{Number(t.quantity).toFixed(2)}</td>
                                                    <td className="ion-text-right">{formatCurrency(t.price)}</td>
                                                    <td className="ion-text-right">{formatCurrency(Number(t.quantity) * Number(t.price) * (Number(t.lot_size) || 1) / 100)}</td>
                                                </tr>
                                            ))}
                                            <tr className="total-row">
                                                <td>Total</td>
                                                <td className="ion-text-right">{totalBQty.toFixed(2)}</td>
                                                <td className="ion-text-right">{formatCurrency(avgBPrice)}</td>
                                                <td className="ion-text-right">{formatCurrency(totalBVol)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Sell Table */}
                                <div className="side-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th className="ion-text-right">S Qty</th>
                                                <th className="ion-text-right">Price</th>
                                                <th className="ion-text-right">S Vol.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sellTrades.map((t: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td>{formatDate(t.order_time)}</td>
                                                    <td className="ion-text-right">{Number(t.quantity).toFixed(2)}</td>
                                                    <td className="ion-text-right">{formatCurrency(t.price)}</td>
                                                    <td className="ion-text-right">{formatCurrency(Number(t.quantity) * Number(t.price) * (Number(t.lot_size) || 1) / 100)}</td>
                                                </tr>
                                            ))}
                                            <tr className="total-row">
                                                <td>Total</td>
                                                <td className="ion-text-right">{totalSQty.toFixed(2)}</td>
                                                <td className="ion-text-right">{formatCurrency(avgSPrice)}</td>
                                                <td className="ion-text-right">{formatCurrency(totalSVol)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Script Summary Block */}
                            <div className="script-summary-block">
                                <div className="summary-line">
                                    <span className="val">{formatCurrency(totalBVol)}</span>
                                </div>
                                <div className="summary-line">
                                    <span className="val">- {formatCurrency(totalSVol)}</span>
                                </div>
                                <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '5px 0', width: '100px', marginLeft: 'auto' }} />
                                <div className="summary-line">
                                    <span className={`val ${getColorClass(totalSVol - totalBVol)}`}>{formatCurrency(Math.abs(totalSVol - totalBVol))}</span>
                                </div>
                                <div className="summary-line br-line">
                                    <span className="lbl">Br</span>
                                    <span className="val text-danger">- {formatCurrency(scriptBrk)}</span>
                                </div>
                                <div className="summary-line result-line">
                                    <span className="lbl">({scriptNetResult >= 0 ? 'P' : 'L'})</span>
                                    <span className={`val ${getColorClass(scriptNetResult)}`}>{formatCurrency(scriptNetResult)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div className="final-summary-section">
                    <h3>Summary</h3>
                    <table className="grand-table">
                        <thead>
                            <tr>
                                <th>Exchange</th>
                                <th>Script</th>
                                <th className="ion-text-right">Total</th>
                                <th className="ion-text-right">Br</th>
                                <th className="ion-text-right">Net</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scripts.map(scriptName => {
                                const scriptTrades = groupedTrades[scriptName];
                                const buyVol = scriptTrades.filter((t: any) => t.action.toLowerCase() === 'buy').reduce((sum: number, t: any) => sum + (Number(t.quantity) * Number(t.price) * (Number(t.lot_size) || 1) / 100), 0);
                                const sellVol = scriptTrades.filter((t: any) => t.action.toLowerCase() === 'sell').reduce((sum: number, t: any) => sum + (Number(t.quantity) * Number(t.price) * (Number(t.lot_size) || 1) / 100), 0);
                                const brk = scriptTrades.reduce((sum: number, t: any) => sum + Number(t.brokerage_amount || 0), 0) / 100;
                                const total = sellVol - buyVol;
                                const net = total - brk;

                                return (
                                    <tr key={scriptName}>
                                        <td>MCX</td>
                                        <td>{scriptName}</td>
                                        <td className={`ion-text-right ${getColorClass(total)}`}>{formatCurrency(total)}</td>
                                        <td className="ion-text-right text-danger" >- {formatCurrency(brk)}</td>
                                        <td className={`ion-text-right ${getColorClass(net)}`}>{formatCurrency(net)}</td>
                                    </tr>
                                );
                            })}
                            <tr className="total-row">
                                <td colSpan={2}>Total</td>
                                <td className={`ion-text-right ${getColorClass(totalNetPL)}`}>{formatCurrency(totalNetPL)}</td>
                                <td className="ion-text-right text-danger">- {formatCurrency(totalBrokerage)}</td>
                                <td className={`ion-text-right ${getColorClass(totalNetPL - totalBrokerage)}`}>{formatCurrency(totalNetPL - totalBrokerage)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {runningTrades.length > 0 && (
                    <div className="final-summary-section running-trades-section">
                        <h3>Running Trades</h3>
                        <table className="grand-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Script</th>
                                    <th>Side</th>
                                    <th className="ion-text-right">Qty</th>
                                    <th className="ion-text-right">Price</th>
                                    <th className="ion-text-right">Vol.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {runningTrades.map((t, idx) => (
                                    <tr key={idx}>
                                        <td>{formatDate(t.order_time)}</td>
                                        <td>{t.name}</td>
                                        <td className={t.action.toLowerCase() === 'buy' ? 'text-success' : 'text-danger'}>
                                            {t.action.toUpperCase()}
                                        </td>
                                        <td className="ion-text-right">{Number(t.quantity).toFixed(2)}</td>
                                        <td className="ion-text-right">{formatCurrency(t.price)}</td>
                                        <td className="ion-text-right">
                                            {formatCurrency(Number(t.quantity) * Number(t.price) * (Number(t.lot_size) || 1) / 100)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* <div className="carry-forward">
                    <div className="script-title">Carry Forward</div>
                </div> */}
            </div>
        </div>
    );
};

export default TradeBill;
