import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Cell, Tooltip as RechartsTooltip, LabelList
} from 'recharts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from 'lucide-react';

// Fixed color palette — never randomised
const BAR_COLORS = [
    { bar: '#6366f1', hover: 'rgba(99,102,241,0.08)', dark: 'rgba(99,102,241,0.12)' },
    { bar: '#a855f7', hover: 'rgba(168,85,247,0.08)', dark: 'rgba(168,85,247,0.12)' },
    { bar: '#ec4899', hover: 'rgba(236,72,153,0.08)', dark: 'rgba(236,72,153,0.12)' },
    { bar: '#f43f5e', hover: 'rgba(244,63,94,0.08)', dark: 'rgba(244,63,94,0.12)' },
    { bar: '#14b8a6', hover: 'rgba(20,184,166,0.08)', dark: 'rgba(20,184,166,0.12)' },
    { bar: '#3b82f6', hover: 'rgba(59,130,246,0.08)', dark: 'rgba(59,130,246,0.12)' },
];

// Custom cursor that gives a subtle themed background on hover
const CustomCursor = ({ x, y, width, height, index }) => {
    const color = BAR_COLORS[index % BAR_COLORS.length];
    // Check dark mode
    const isDark = document.documentElement.classList.contains('dark');
    const fill = isDark ? color.dark : color.hover;
    return (
        <rect
            x={x - 4}
            y={0}
            width={width + 8}
            height={height + y}
            fill={fill}
            rx={6}
            style={{ transition: 'fill 0.15s' }}
        />
    );
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const entry = payload[0];
    const idx = entry?.payload?._idx ?? 0;
    const color = BAR_COLORS[idx % BAR_COLORS.length].bar;
    return (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 shadow-xl text-xs">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{label}</p>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: color }} />
                <span className="text-zinc-600 dark:text-zinc-400">Tickets:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{entry.value}</span>
            </div>
        </div>
    );
};

const PipelineChart = ({ statusData }) => {
    // Enrich data with fixed index so colors don't change on refresh
    const enrichedData = useMemo(() =>
        (statusData || []).map((d, i) => ({ ...d, _idx: i })),
    [statusData]);

    // Compute a fixed Y-axis domain based on max value — rounded to nearest 5
    const maxVal = useMemo(() => {
        if (!enrichedData.length) return 10;
        const m = Math.max(...enrichedData.map(d => d.value || 0));
        return Math.max(Math.ceil(m / 5) * 5, 5);
    }, [enrichedData]);

    return (
        <Card className="relative overflow-hidden bg-white dark:bg-[#161616] backdrop-blur-xl shadow-sm border-zinc-200/50 dark:border-zinc-800 rounded-2xl h-full flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300">
            {/* Ambient glow */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-400/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-400/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

            <CardHeader className="relative z-10 border-b border-zinc-100 dark:border-zinc-800 px-6 py-5 flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center">
                    Ticket Pipeline
                    <TooltipProvider delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-4 w-4 ml-2 text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium shadow-xl text-xs max-w-[180px]">
                                Real-time distribution across all processing stages.
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardTitle>
                <div className="flex items-center gap-1.5">
                    {enrichedData.slice(0, 3).map((d, i) => (
                        <div key={d.name} className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: BAR_COLORS[i].bar }} />
                            {d.name}
                        </div>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-6 min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={enrichedData} margin={{ top: 16, right: 8, left: -20, bottom: 0 }} barSize={34}
                        onMouseLeave={() => {}}>
                        <defs>
                            {enrichedData.map((d, i) => (
                                <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={BAR_COLORS[i % BAR_COLORS.length].bar} stopOpacity={0.95} />
                                    <stop offset="100%" stopColor={BAR_COLORS[i % BAR_COLORS.length].bar} stopOpacity={0.65} />
                                </linearGradient>
                            ))}
                            <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.12" />
                            </filter>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="2 4"
                            stroke="currentColor"
                            className="text-zinc-200 dark:text-zinc-800"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 500 }}
                            className="text-zinc-500 dark:text-zinc-400"
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            domain={[0, maxVal]}
                            allowDataOverflow={false}
                            tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 500 }}
                            className="text-zinc-500 dark:text-zinc-400"
                            axisLine={false}
                            tickLine={false}
                            dx={-8}
                            tickCount={6}
                        />
                        <RechartsTooltip
                            content={<CustomTooltip />}
                            cursor={<CustomCursor />}
                        />
                        <Bar dataKey="value" radius={[5, 5, 0, 0]} filter="url(#barShadow)" isAnimationActive={true} animationDuration={600}>
                            {enrichedData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={`url(#grad-${index})`}
                                    style={{ cursor: 'pointer' }}
                                />
                            ))}
                            <LabelList
                                dataKey="value"
                                position="top"
                                style={{ fill: 'currentColor', fontSize: '11px', fontWeight: 700 }}
                                className="text-zinc-500 dark:text-zinc-400"
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default PipelineChart;
