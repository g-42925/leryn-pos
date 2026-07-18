"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BookOpen, Plus, Loader2, RefreshCw, Trash2, GitPullRequest } from "lucide-react"
import useGlobalState from "@/store/global"
import { getBranchesAction } from "@/app/actions/manage-branch"
import { getRecipesAction, getBranchInventoryItemsAction, addRecipeAction } from "@/app/actions/manage-recipe"

export default function ManageRecipePage() {
  const { accountId, hasHydrated } = useGlobalState()

  const [branches, setBranches] = useState<any[]>([])
  const [recipes, setRecipes] = useState<any[]>([])
  // For the selected branch in the form
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [name, setName] = useState("")
  const [branchId, setBranchId] = useState("")
  const [ingredients, setIngredients] = useState<{ inventoryItemId: string, quantity: number }[]>([
    { inventoryItemId: "", quantity: 1 }
  ])

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [loadingItems, setLoadingItems] = useState(false)

  const loadData = async () => {
    if (!accountId) return
    setLoading(true)
    try {
      const [branchesResult, recipesResult] = await Promise.all([
        getBranchesAction(accountId),
        getRecipesAction(accountId)
      ])

      if (branchesResult.success) {
        setBranches(branchesResult.data || [])
      }
      if (recipesResult.success) {
        setRecipes(recipesResult.data || [])
      }
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasHydrated && accountId) {
      loadData()
    } else if (hasHydrated && !accountId) {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, hasHydrated])

  // Fetch inventory items when branchId changes
  useEffect(() => {
    const fetchItems = async () => {
      if (!branchId || !accountId) {
        setInventoryItems([])
        return
      }
      setLoadingItems(true)
      try {
        const result = await getBranchInventoryItemsAction(branchId, accountId)
        if (result.success) {
          setInventoryItems(result.data || [])
          // Reset ingredients when branch changes to avoid invalid items
          setIngredients([{ inventoryItemId: "", quantity: 1 }])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingItems(false)
      }
    }

    fetchItems()
  }, [branchId, accountId])

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { inventoryItemId: "", quantity: 1 }])
  }

  const handleRemoveIngredient = (index: number) => {
    const next = [...ingredients]
    next.splice(index, 1)
    setIngredients(next)
  }

  const handleIngredientChange = (index: number, field: 'inventoryItemId' | 'quantity', value: any) => {
    const next = [...ingredients]
    next[index] = { ...next[index], [field]: value }
    setIngredients(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !branchId) {
      setError("Nama resep dan Cabang wajib diisi!")
      return
    }

    // Filter valid ingredients
    const validIngredients = ingredients.filter(i => i.inventoryItemId && i.quantity > 0)
    if (validIngredients.length === 0) {
      setError("Tambahkan setidaknya 1 bahan baku yang valid!")
      return
    }

    setSubmitting(true)
    setError("")

    const result = await addRecipeAction(accountId, branchId, name, validIngredients)
    if (result.success) {
      setName("")
      setBranchId("")
      setIngredients([{ inventoryItemId: "", quantity: 1 }])
      setInventoryItems([])
      loadData()
    } else {
      setError(result.message)
    }
    setSubmitting(false)
  }

  if (!hasHydrated || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin w-10 h-10 text-sky-600" />
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
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin-dashboard" className="text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors">
                &larr; Back to Dashboard
              </Link>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Manage Recipe</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Kelola resep dan bahan baku yang diperlukan per cabang.</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transform rotate-3">
            <BookOpen size={28} />
          </div>
        </header>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Tambah Resep Baru</h2>
          {error && <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Resep</label>
                <input
                  type="text"
                  placeholder="Contoh: Es Kopi Susu Aren"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pilih Cabang</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-orange-500 outline-none transition-all appearance-none"
                  required
                >
                  <option value="" disabled className="dark:bg-slate-900">Pilih Cabang</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id} className="dark:bg-slate-900">
                      {b.name}
                    </option>
                  ))}
                </select>
                {branches.length === 0 && (
                  <p className="text-xs text-orange-500 mt-1">
                    Anda belum membuat Cabang. <Link href="/admin-dashboard/manage-branch" className="underline font-bold">Buat sekarang</Link>.
                  </p>
                )}
              </div>
            </div>

            {/* Ingredients Section */}
            {branchId && (
              <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <GitPullRequest size={18} />
                    <span>Bahan Baku (Ingredients)</span>
                  </h3>
                  {loadingItems && <Loader2 className="animate-spin w-4 h-4 text-orange-500" />}
                </div>

                <div className="space-y-3">
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="flex gap-3 items-end">
                      <div className="flex-1 space-y-1">
                        {idx === 0 && <label className="text-xs font-semibold text-slate-500">Pilih Item Inventory</label>}
                        <select
                          value={ing.inventoryItemId}
                          onChange={(e) => handleIngredientChange(idx, 'inventoryItemId', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                          required
                        >
                          <option value="" disabled className="dark:bg-slate-900">Pilih Item</option>
                          {inventoryItems.map((item) => (
                            <option key={item._id} value={item._id} className="dark:bg-slate-900">
                              {item.name} ({item.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24 space-y-1">
                        {idx === 0 && <label className="text-xs font-semibold text-slate-500">Jumlah</label>}
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={ing.quantity}
                          onChange={(e) => handleIngredientChange(idx, 'quantity', parseFloat(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        disabled={ingredients.length <= 1}
                        className="h-12 w-12 flex items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 disabled:opacity-50 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="mt-4 px-4 py-2 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
                >
                  <Plus size={16} /> Tambah Bahan
                </button>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={submitting || branches.length === 0}
                className="px-8 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>Simpan Resep</span>
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Daftar Resep per Cabang</h2>
            <button onClick={loadData} className="text-orange-600 hover:text-orange-700 flex items-center gap-1 text-sm font-medium transition-colors">
              <RefreshCw size={16} /> <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                Belum ada resep yang terdaftar.
              </div>
            ) : (
              recipes.map((recipe) => (
                <div
                  key={recipe._id}
                  className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all hover:border-orange-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-500 to-transparent opacity-10 group-hover:opacity-20 rounded-bl-full transition-opacity" />

                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center">
                      <BookOpen size={24} />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">{recipe.name}</h3>
                  <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-4">
                    Cabang: {recipe.branchId?.name || "Unknown Branch"}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
