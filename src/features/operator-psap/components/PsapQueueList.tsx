import React from "react";
import { Radio } from "lucide-react";
import { DemandaItem } from "@/src/modules/psap/types";

export interface PsapQueueListProps {
  operatorFocusMode: boolean;
  filteredQueue: DemandaItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function PsapQueueList({
  operatorFocusMode,
  filteredQueue,
  selectedId,
  onSelect,
}: PsapQueueListProps) {
  return (
    <section
      className={`col-span-12 ${
        operatorFocusMode ? "lg:col-span-4" : "lg:col-span-5"
      } flex flex-col h-full min-h-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden`}
      aria-label="Sección de cola"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
        <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
          <Radio className="h-4 w-4 text-slate-700 dark:text-slate-300 animate-pulse" />
          Cola de demandas (Incidentes ACD)
        </h2>
        <span className="rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
          {filteredQueue.length} en espera
        </span>
      </div>

      <div
        className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800"
        role="list"
        aria-label="Lista de demandas"
      >
        {filteredQueue.map((item, index) => {
          const isSelected = item.id === selectedId;
          return (
            <div
              key={`${item.id}-${index}`}
              role="listitem"
              tabIndex={0}
              onClick={() => onSelect(item.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSelect(item.id);
              }}
              className={`p-3.5 transition cursor-pointer select-none flex items-center justify-between gap-3 ${
                isSelected
                  ? "border-l-[3px] border-l-[#0f6cbd] bg-sky-50/70 dark:bg-sky-950/40 font-semibold"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-[3px] border-l-transparent"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`rounded-md px-2 py-1 text-xs font-black uppercase tracking-wider shrink-0 ${
                    item.priority === "P0"
                      ? "bg-red-900 text-white border border-red-700 shadow-xs"
                      : item.priority === "P1"
                      ? "bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 font-bold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-bold"
                  }`}
                >
                  {item.priority}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-black text-slate-900 dark:text-white shrink-0">
                      {item.id}
                    </span>
                    {item.requiresLse && (
                      <span className="rounded bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 px-1.5 py-0.2 text-[10px] font-bold shrink-0">
                        LSE
                      </span>
                    )}
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate block">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate mt-0.5">
                    {item.caller} · {item.location}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  {item.wait}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {item.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
