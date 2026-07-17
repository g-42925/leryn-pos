"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Grid, Plus, Loader2, RefreshCw, Box, AppWindow, User } from "lucide-react"
import useGlobalState from "@/store/global"
import { getBranchesAction } from "@/app/actions/manage-branch"
import { getTableAreasAction, getBranchTablesAction, addTableAreaAction, addTableAction, updateTablePositionAction } from "@/app/actions/manage-table"

function DraggableTable({ table, allTables, accountId, onPositionUpdate }: { table: any, allTables?: any[], accountId: string, onPositionUpdate: (id: string, x: number, y: number) => Promise<void> }) {
  const [position, setPosition] = useState({ x: table.x || 0, y: table.y || 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [snapLines, setSnapLines] = useState<{x?: number, y?: number}>({})
  const dragStartPos = useRef({ x: 0, y: 0 })
  const initialTablePos = useRef({ x: table.x || 0, y: table.y || 0 })

  useEffect(() => {
    if (!isDragging) {
      setPosition({ x: table.x || 0, y: table.y || 0 })
      initialTablePos.current = { x: table.x || 0, y: table.y || 0 }
    }
  }, [table.x, table.y, isDragging])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    initialTablePos.current = { ...position }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const dx = e.clientX - dragStartPos.current.x
    const dy = e.clientY - dragStartPos.current.y
    let newX = Math.max(0, initialTablePos.current.x + dx)
    let newY = Math.max(0, initialTablePos.current.y + dy)

    let snapX: number | undefined = undefined
    let snapY: number | undefined = undefined
    const SNAP_THRESHOLD = 15

    if (allTables) {
      for (const other of allTables) {
        if (other._id === table._id) continue
        
        // Snapping logic X (left edge)
        if (Math.abs(newX - other.x) < SNAP_THRESHOLD) {
          newX = other.x
          snapX = other.x
        }
        
        // Snapping logic Y (top edge)
        if (Math.abs(newY - other.y) < SNAP_THRESHOLD) {
          newY = other.y
          snapY = other.y
        }
      }
    }

    setPosition({ x: newX, y: newY })
    setSnapLines({ x: snapX, y: snapY })
  }

  const handlePointerUp = async (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!isDragging) return
    setIsDragging(false)
    setSnapLines({})
    e.currentTarget.releasePointerCapture(e.pointerId)

    if (position.x !== initialTablePos.current.x || position.y !== initialTablePos.current.y) {
      await onPositionUpdate(table._id, position.x, position.y)
    }
  }

  return (
    <>
      {isDragging && snapLines.x !== undefined && (
        <div 
          className="absolute top-0 bottom-0 border-l-2 border-dashed border-cyan-500 pointer-events-none" 
          style={{ left: `${snapLines.x}px`, zIndex: 10 }} 
        />
      )}
      {isDragging && snapLines.y !== undefined && (
        <div 
          className="absolute left-0 right-0 border-t-2 border-dashed border-cyan-500 pointer-events-none" 
          style={{ top: `${snapLines.y}px`, zIndex: 10 }} 
        />
      )}
      <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`absolute cursor-move select-none p-4 rounded-xl flex flex-col items-center justify-center gap-2 border transition-shadow ${isDragging ? 'border-cyan-500 shadow-2xl z-50 scale-105' : 'border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-950/90 shadow-md hover:border-cyan-400 z-10 backdrop-blur-md'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none'
      }}
    >
      <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center text-cyan-600 dark:text-cyan-400">
        <AppWindow size={24} />
      </div>
      <span className="font-bold text-lg">{table.name}</span>
      <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
        <User size={12} /> {table.capacity} Pax
      </div>
      </div>
    </>
  )
}

export default function ManageTablePage() {
  const { accountId, role, branch: userBranch, hasHydrated } = useGlobalState()
  const isSuperadmin = role === 'superadmin'

  const [branches, setBranches] = useState<any[]>([])

  // Data for selected branch
  const [tableAreas, setTableAreas] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingBranchData, setLoadingBranchData] = useState(false)

  // Selection
  const [branchId, setBranchId] = useState("")

  // Layout Tab State
  const [selectedAreaId, setSelectedAreaId] = useState("")

  // Form State: Add Area
  const [areaName, setAreaName] = useState("")
  const [addingArea, setAddingArea] = useState(false)
  const [areaError, setAreaError] = useState("")

  // Form State: Add Table
  const [tableAreaId, setTableAreaId] = useState("")
  const [tableName, setTableName] = useState("")
  const [tableCapacity, setTableCapacity] = useState<number | "">(2)
  const [addingTable, setAddingTable] = useState(false)
  const [tableError, setTableError] = useState("")

  const loadInitialData = async () => {
    if (!accountId) return
    setLoading(true)
    try {
      const branchesResult = await getBranchesAction(accountId)
      if (branchesResult.success) {
        setBranches(branchesResult.data || [])
      }
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadBranchData = async (selectedBranchId: string, showSpinner = true) => {
    if (!accountId || !selectedBranchId) {
      setTableAreas([])
      setTables([])
      return
    }
    if (showSpinner) setLoadingBranchData(true)
    try {
      const [areasResult, tablesResult] = await Promise.all([
        getTableAreasAction(accountId, selectedBranchId),
        getBranchTablesAction(accountId, selectedBranchId)
      ])

      if (areasResult.success) {
        const ad = areasResult.data || []
        setTableAreas(ad)
        if (ad.length > 0) {
          setSelectedAreaId(ad[0]._id)
        } else {
          setSelectedAreaId("")
        }
      }
      if (tablesResult.success) {
        setTables(tablesResult.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingBranchData(false)
    }
  }

  useEffect(() => {
    if (hasHydrated && accountId) {
      loadInitialData()
      if (!isSuperadmin && userBranch) {
        setBranchId(userBranch)
      }
    } else if (hasHydrated && !accountId) {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, hasHydrated, isSuperadmin, userBranch])

  useEffect(() => {
    loadBranchData(branchId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId])

  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!areaName.trim() || !branchId) {
      setAreaError("Semua field wajib diisi!")
      return
    }

    setAddingArea(true)
    setAreaError("")

    const result = await addTableAreaAction(accountId, branchId, areaName)
    if (result.success) {
      setAreaName("")
      loadBranchData(branchId, false)
    } else {
      setAreaError(result.message)
    }
    setAddingArea(false)
  }

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tableName.trim() || !branchId || !tableAreaId || tableCapacity === "") {
      setTableError("Semua field wajib diisi!")
      return
    }

    if (Number(tableCapacity) <= 0) {
      setTableError("Kapasitas harus lebih dari 0!")
      return
    }

    setAddingTable(true)
    setTableError("")

    const result = await addTableAction(accountId, branchId, tableAreaId, tableName, Number(tableCapacity))
    if (result.success) {
      setTableName("")
      setTableCapacity(2)
      loadBranchData(branchId, false)
    } else {
      setTableError(result.message)
    }
    setAddingTable(false)
  }

  const handlePositionUpdate = async (tableId: string, x: number, y: number) => {
    if (!accountId) return
    
    // Update state locally so changing tabs retains the new coordinates
    setTables(prev => prev.map(t => t._id === tableId ? { ...t, x, y } : t))
    
    const res = await updateTablePositionAction(accountId, tableId, x, y)
    if (!res.success) {
      console.error(res.message)
    }
  }

  if (!hasHydrated || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin w-10 h-10 text-cyan-600" />
      </div>
    )
  }

  if (!accountId) {
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Error: Account ID tidak ditemukan. Harap login ulang.
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-6 sm:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin-dashboard" className="text-sm font-medium text-slate-500 hover:text-cyan-600 transition-colors">
                &larr; Back to Dashboard
              </Link>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Manage Table</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Kelola area/section dan letakkan posisi meja sesuai blueprint asli.</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transform rotate-3">
            <AppWindow size={28} />
          </div>
        </header>

        {/* TOP LEVEL: BRANCH SELECTION */}
        {isSuperadmin && (
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Pilih Cabang (Branch)</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full max-w-md px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-cyan-500 outline-none transition-all appearance-none"
              required
            >
              <option value="" disabled className="dark:bg-slate-900">Pilih Cabang untuk mengelola area</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id} className="dark:bg-slate-900">
                  {b.name}
                </option>
              ))}
            </select>
            {branches.length === 0 && (
              <p className="text-xs text-cyan-500 mt-3">
                Anda belum membuat Cabang. <Link href="/admin-dashboard/manage-branch" className="underline font-bold">Buat sekarang</Link>.
              </p>
            )}
          </section>
        )}

        {branchId && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ADD AREA FORM */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Box size={24} className="text-cyan-600" />
                Tambah Area (Section)
              </h2>
              {areaError && <div className="mb-4 p-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">{areaError}</div>}
              <form onSubmit={handleAddArea} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Area</label>
                  <input
                    type="text"
                    placeholder="Contoh: Main Hall, VIP Room, Outdoor"
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={addingArea || !branchId}
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    {addingArea ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    <span>Simpan Area</span>
                  </button>
                </div>
              </form>
            </section>

            {/* ADD TABLE FORM */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Grid size={24} className="text-cyan-600" />
                Tambah Meja (Table)
              </h2>
              {tableError && <div className="mb-4 p-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">{tableError}</div>}
              <form onSubmit={handleAddTable} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pilih Area</label>
                    <select
                      value={tableAreaId}
                      onChange={(e) => setTableAreaId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-cyan-500 outline-none transition-all appearance-none disabled:opacity-50"
                      required
                      disabled={loadingBranchData || tableAreas.length === 0}
                    >
                      <option value="" disabled className="dark:bg-slate-900">Pilih Area</option>
                      {tableAreas.map((area) => (
                        <option key={area._id} value={area._id} className="dark:bg-slate-900">
                          {area.name}
                        </option>
                      ))}
                    </select>
                    {tableAreas.length === 0 && !loadingBranchData && (
                      <p className="text-xs text-cyan-600 mt-1 font-medium">
                        Buat Area terlebih dahulu sebelum menambah Meja.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">No/Nama Meja</label>
                    <input
                      type="text"
                      placeholder="Contoh: T-1"
                      value={tableName}
                      onChange={(e) => setTableName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Kapasitas Kursi</label>
                    <input
                      type="number"
                      placeholder="Contoh: 4"
                      value={tableCapacity}
                      onChange={(e) => setTableCapacity(e.target.value ? Number(e.target.value) : "")}
                      min="1"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={addingTable || !branchId || !tableAreaId || tableAreas.length === 0}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    {addingTable ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    <span>Simpan Meja</span>
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* LIST AREAS AND TABLES CANVAS */}
        {branchId && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Floorplan & Layout Meja</h2>
              <button onClick={() => loadBranchData(branchId)} className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1 text-sm font-medium transition-colors">
                <RefreshCw size={16} /> <span>Refresh</span>
              </button>
            </div>

            {loadingBranchData ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="animate-spin w-8 h-8 text-cyan-600" />
              </div>
            ) : tableAreas.length === 0 ? (
              <div className="py-16 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                Belum ada area yang terdaftar di cabang ini.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Tabs */}
                {tableAreas.length > 1 && (
                  <div className="flex flex-wrap gap-2 mb-4 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
                    {tableAreas.map((area) => (
                      <button
                        key={area._id}
                        onClick={() => setSelectedAreaId(area._id)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedAreaId === area._id ? 'bg-white dark:bg-slate-900 text-cyan-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}
                      >
                        {area.name}
                      </button>
                    ))}
                  </div>
                )}
                
                {tableAreas.filter(a => a._id === selectedAreaId).map((area) => {
                  const areaTables = tables.filter((t) => t.tableAreaId === area._id)

                  return (
                    <div key={area._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <Box size={24} className="text-cyan-500" />
                          {area.name}
                        </h3>
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold">
                          {areaTables.length} Meja
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-6 italic">
                        * Klik dan geser (drag & drop) meja ke posisi yang diinginkan. Posisi akan langsung tersimpan.
                      </div>

                      {areaTables.length === 0 ? (
                        <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                          Belum ada meja di area ini.
                        </div>
                      ) : (
                        <div
                          className="relative w-full h-[600px] border border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900/40"
                          style={{
                            backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                          }}
                        >
                          {areaTables.map((table) => (
                            <DraggableTable
                              key={table._id}
                              table={table}
                              allTables={areaTables}
                              accountId={accountId}
                              onPositionUpdate={handlePositionUpdate}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

      </div>
    </main>
  )
}
