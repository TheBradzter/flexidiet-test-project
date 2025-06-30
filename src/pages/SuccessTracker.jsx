
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DailyAdherence } from '@/api/entities';
import { MealPlan } from '@/api/entities';
import { format, subDays, startOfDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CheckCircle2, Edit3, XCircle, ClipboardCheck, Smile, Meh, Frown, Loader2 } from 'lucide-react';

export default function SuccessTrackerPage() {
    const [logs, setLogs] = useState([]);
    const [todaysLog, setTodaysLog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLogging, setIsLogging] = useState(false);

    useEffect(() => {
        loadAdherenceData();
    }, []);

    const loadAdherenceData = async () => {
        setLoading(true);
        try {
            const sevenDaysAgo = startOfDay(subDays(new Date(), 6)).toISOString();
            const recentLogs = await DailyAdherence.filter({
                created_date: { $gte: sevenDaysAgo }
            }, '-date');

            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const foundTodaysLog = recentLogs.find(log => log.date === todayStr);
            
            setTodaysLog(foundTodaysLog || null);
            
            // Prepare data for the chart
            const chartData = [];
            for (let i = 6; i >= 0; i--) {
                const date = startOfDay(subDays(new Date(), i));
                const dateStr = format(date, 'yyyy-MM-dd');
                const logForDay = recentLogs.find(log => log.date === dateStr);
                chartData.push({
                    name: format(date, 'EEE'),
                    status: logForDay ? logForDay.status : 'pending'
                });
            }
            setLogs(chartData);

        } catch (error) {
            console.error("Error loading adherence data:", error);
        }
        setLoading(false);
    };

    const handleLogAdherence = async (status) => {
        setIsLogging(true);
        try {
            const plans = await MealPlan.list('-created_date', 1);
            if (plans.length === 0) {
                alert("You need an active meal plan to log your adherence.");
                setIsLogging(false);
                return;
            }

            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const logData = {
                date: todayStr,
                status: status,
                meal_plan_id: plans[0].id
            };

            if (todaysLog) {
                await DailyAdherence.update(todaysLog.id, logData);
            } else {
                await DailyAdherence.create(logData);
            }
            await loadAdherenceData(); // Refresh data
        } catch (error) {
            console.error("Error logging adherence:", error);
        }
        setIsLogging(false);
    };

    const statusConfig = {
        followed: { Icon: Smile, color: '#84cc16', label: 'Mostly Followed' },
        modified: { Icon: Meh, color: '#f59e0b', label: 'Made Changes' },
        did_own_thing: { Icon: Frown, color: '#ef4444', label: 'Did My Own Thing' },
        pending: { Icon: null, color: '#e5e7eb', label: 'Not Logged' }
    };

    const adherenceRate = logs.filter(log => log.status === 'followed').length / logs.filter(log => log.status !== 'pending').length * 100;

    return (
        <div className="min-h-screen py-8 px-4 text-white" style={{ backgroundColor: '#005A8D' }}>
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Success and Progress Tracker</h1>
                    <p className="text-white/80 mt-1">
                        Track how well you are sticking to your meal plan, upload progress photos and celebrate your progress!
                    </p>
                </div>

                <Card className="glass-card shadow-2xl border-0 bg-white text-gray-900">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Today's Check-in: {format(new Date(), 'MMMM d')}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center p-8">
                        {loading ? (
                            <Loader2 className="w-8 h-8 mx-auto animate-spin text-green-500" />
                        ) : todaysLog ? (
                            <div className="space-y-4">
                                <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
                                <h3 className="text-2xl font-bold">Thanks for logging!</h3>
                                <p className="text-gray-600">You logged: <span className="font-semibold text-green-600">{statusConfig[todaysLog.status].label}</span></p>
                                <Button variant="outline" onClick={() => setTodaysLog(null)}>Change Answer</Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-semibold">How did you stick to your meal plan today?</h3>
                                <div className="flex flex-col md:flex-row gap-4 justify-center">
                                    <Button disabled={isLogging} onClick={() => handleLogAdherence('followed')} className="h-20 text-lg text-white flex-1" style={{ backgroundColor: '#6BBD4F' }}>
                                        <Smile className="w-6 h-6 mr-3"/> Mostly followed it
                                    </Button>
                                    <Button disabled={isLogging} onClick={() => handleLogAdherence('modified')} className="h-20 text-lg bg-amber-500 hover:bg-amber-600 text-white flex-1">
                                        <Meh className="w-6 h-6 mr-3"/> Made some changes
                                    </Button>
                                    <Button disabled={isLogging} onClick={() => handleLogAdherence('did_own_thing')} className="h-20 text-lg bg-red-500 hover:bg-red-600 text-white flex-1">
                                        <Frown className="w-6 h-6 mr-3"/> Did my own thing
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="glass-card shadow-2xl border-0 bg-white text-gray-900">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">This Week's Progress</CardTitle>
                         { !isNaN(adherenceRate) && (
                            <p className="text-gray-600">
                                You've followed your plan <span className="font-bold text-green-600">{adherenceRate.toFixed(0)}%</span> of the time this week.
                            </p>
                         )}
                    </CardHeader>
                    <CardContent style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={logs} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="name" stroke="#4b5563" />
                                <YAxis tick={false} axisLine={false} stroke="#4b5563" />
                                <Tooltip
                                    cursor={{fill: 'rgba(209, 213, 219, 0.3)'}}
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                                    formatter={(value, name, props) => [statusConfig[props.payload.status].label, null]}
                                />
                                <Bar dataKey="status">
                                    {logs.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={statusConfig[entry.status].color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
