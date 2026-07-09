import { formatNumber, formatPrice } from "@/lib/format";
import type { PricePoint } from "@/lib/types";

export function PriceTable({ data }: { data: PricePoint[] }) {
  const rows = data.slice(-20).reverse();

  if (rows.length === 0) return null;

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-soft">
      <div className="mb-3">
        <h3 className="text-base font-bold text-ink">과거 시세 표</h3>
        <p className="mt-1 text-xs font-medium text-zinc-500">차트와 동일한 일별 시세 데이터의 최근 거래일입니다.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-xs font-bold text-zinc-500">
              <th className="py-2 pr-4">날짜</th>
              <th className="py-2 pr-4">시가</th>
              <th className="py-2 pr-4">고가</th>
              <th className="py-2 pr-4">저가</th>
              <th className="py-2 pr-4">종가</th>
              <th className="py-2 pr-4">거래량</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.date} className="border-b border-zinc-100">
                <td className="py-2 pr-4 font-semibold text-ink">{row.date}</td>
                <td className="py-2 pr-4 text-zinc-700">{formatPrice(row.open ?? row.close)}</td>
                <td className="py-2 pr-4 text-zinc-700">{formatPrice(row.high ?? row.close)}</td>
                <td className="py-2 pr-4 text-zinc-700">{formatPrice(row.low ?? row.close)}</td>
                <td className="py-2 pr-4 font-bold text-ink">{formatPrice(row.close)}</td>
                <td className="py-2 pr-4 text-zinc-700">{formatNumber(row.volume)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
