import { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

export default function BtcChart() {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;

    const chart = createChart(container, {
        width: container.clientWidth,
        height: container.clientHeight,
        layout: {
        background: { color: "#111827" },
        textColor: "#9ca3af",
        },
        grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" },
        },
    });

    const series = chart.addLineSeries({
        color: "#00ff88",
        lineWidth: 2,
    });

    async function loadChart() {
        const res = await fetch(
        "https://gqfcaofbabbrgmmwsobs.supabase.co/functions/v1/get-btc-chart"
        );

        const data = await res.json();

        if (!Array.isArray(data)) return;

        series.setData(data);
        chart.timeScale().fitContent();
    }

    loadChart();

    // 🔥 RESPONSIVE RESIZE FIX
    const resizeObserver = new ResizeObserver(entries => {
        if (!entries.length) return;

        const { width, height } = entries[0].contentRect;

        chart.applyOptions({
        width,
        height,
        });
    });

    resizeObserver.observe(container);

    return () => {
        resizeObserver.disconnect();
        chart.remove();
    };
    }, []);

  return (
    <div
        style={{
        background: "#111827",
        padding: "1rem",
        borderRadius: "12px",
        width: "100%",
        height: "420px", // 🔥 IMPORTANT
        display: "flex",
        flexDirection: "column",
        }}
    >
        <h3 style={{ color: "white", marginBottom: "10px" }}>BTC Chart</h3>

        <div
        ref={chartContainerRef}
        style={{
            flex: 1,          // 🔥 takes remaining space
            width: "100%",
        }}
        />
    </div>
    );
}