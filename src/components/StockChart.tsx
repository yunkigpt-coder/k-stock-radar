"use client";

import { useMemo, useState } from "react";
import { Area, Bar, CartesianGrid, ComposedChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PricePoint } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export function StockChart({ data }: { data: PricePoint[] }) {
  const [period, setPeriod] = useState<"1M" | "3M" | "6M" | "1Y">("3M");
  const visibleData = useMemo(() => {
    const count = period === "1M" ? 6 : period === "3M" ? 10 : period === "6M" ? 14 : data.length;
    return data.slice(-count);
  }, [data, period]);
  const average = Math.round(visibleData.reduce((sum, item) => sum + item.close, 0) / visibleData.length);
  const current = visibleData.at(-1)?.close ?? 0;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-soft">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-zinc-500">Price / Volume</p>
          <p className="text-lg font-bold text-ink">{formatPrice(current)}</p>
        </div>
        <div className="flex rounded-md border border-zinc-200 bg-paper p-1">
          {(["1M", "3M", "6M", "1Y"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPeriod(item)}
              className={`rounded px-3 py-1.5 text-xs font-bold transition ${period === item ? "bg-white text-marine shadow-sm" : "text-zinc-500 hover:text-marine"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={visibleData} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid stroke="#e4e7e0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#68707a" }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="price" domain={["dataMin - 1500", "dataMax + 1500"]} tick={{ fontSize: 12, fill: "#68707a" }} tickLine={false} axisLine={false} width={58} />
            <YAxis yAxisId="volume" orientation="right" hide />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #d7dbd3",
                boxShadow: "0 10px 30px rgba(32, 45, 58, 0.12)",
                fontSize: 12
              }}
              formatter={(value: unknown, name: unknown) => [
                name === "volume" ? new Intl.NumberFormat("ko-KR").format(Number(value)) : formatPrice(Number(value)),
                name === "close" ? "종가" : "거래량"
              ]}
            />
            <ReferenceLine yAxisId="price" y={average} stroke="#d99a34" strokeDasharray="4 4" label={{ value: "평균", fill: "#9a6a1f", fontSize: 11 }} />
            <ReferenceLine yAxisId="price" y={current} stroke="#0f5f68" strokeDasharray="3 5" label={{ value: "현재", fill: "#0f5f68", fontSize: 11 }} />
            <Area yAxisId="price" type="monotone" dataKey="close" stroke="#0f5f68" fill="#62bda8" fillOpacity={0.16} strokeWidth={3} />
            <Bar yAxisId="volume" dataKey="volume" fill="#d99a34" opacity={0.22} barSize={16} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
