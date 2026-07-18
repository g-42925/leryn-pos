"use client"

import { useState } from "react"
import { Users } from "lucide-react"

export function TableMap({ areas, tables }: { areas: any[]; tables: any[] }) {
  const [activeAreaId, setActiveAreaId] = useState<string>(areas[0]?._id || "")

  const activeTables = tables.filter((t) => t.tableAreaId === activeAreaId)

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Area Tabs */}
      <div className="flex items-center gap-2">
        {areas.map((area) => (
          <button
            key={area._id}
            onClick={() => setActiveAreaId(area._id)}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
              activeAreaId === area._id
                ? "bg-teal-500 text-white shadow-md shadow-teal-500/30 scale-105"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {area.name}
          </button>
        ))}
      </div>

      {/* Map Canvas */}
      <div className="flex-1 border-2 border-dashed border-gray-300 rounded-3xl relative overflow-auto bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
        {activeTables.map((table) => {
          const isOccupied = table.status === "occupied"
          
          return (
             <div
               key={table._id}
               style={{
                 left: table.x,
                 top: table.y,
               }}
               className={`absolute w-28 h-28 rounded-2xl flex flex-col items-center justify-center p-3 shadow-xl transition-transform hover:scale-105 cursor-pointer ring-4 ring-offset-2 ring-transparent ${
                 isOccupied 
                   ? "bg-red-50 text-red-900 border-2 border-red-200 ring-red-100" 
                   : "bg-white text-gray-800 border-2 border-gray-200 ring-teal-50 hover:border-teal-500 hover:text-teal-700"
               }`}
             >
               <div className="font-black text-lg mb-1">{table.name}</div>
               
               <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                 isOccupied ? "bg-red-200/50 text-red-700" : "bg-gray-100 text-gray-500"
               }`}>
                 <Users size={12} /> {table.capacity}
               </div>

               <div className={`text-[10px] font-black uppercase tracking-wider mt-2 ${
                  isOccupied ? "text-red-500" : "text-teal-500"
               }`}>
                 {isOccupied ? "Terisi" : "Tersedia"}
               </div>
             </div>
          )
        })}

        {activeTables.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium bg-white/50 backdrop-blur-sm">
            Belum ada meja di area ini
          </div>
        )}
      </div>
    </div>
  )
}
