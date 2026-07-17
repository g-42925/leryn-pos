"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Utensils, Plus, Loader2, RefreshCw, BookOpen } from "lucide-react"
import useGlobalState from "@/store/global"
import { getBranchesAction } from "@/app/actions/manage-branch"
import { getMenusAction, getBranchRecipesAction, addMenuAction, getBranchCategoriesAction, addMenuCategoryAction } from "@/app/actions/manage-menu"

export default function ManageMenuPage() {
  const { accountId, role, branch: userBranch, hasHydrated } = useGlobalState()
  const isSuperadmin = role === 'superadmin'

  const [branches, setBranches] = useState<any[]>([])
  const [menus, setMenus] = useState<any[]>([])
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [name, setName] = useState("")
  const [branchId, setBranchId] = useState("")
  const [recipeId, setRecipeId] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [price, setPrice] = useState<number | "">("")
  const [taxIncluded, setTaxIncluded] = useState<boolean>(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [loadingRecipes, setLoadingRecipes] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

  const loadData = async () => {
    if (!accountId) return
    setLoading(true)
    try {
      const [branchesResult, menusResult] = await Promise.all([
        getBranchesAction(accountId),
        getMenusAction(accountId)
      ])

      if (branchesResult.success) {
        setBranches(branchesResult.data || [])
      }
      if (menusResult.success) {
        setMenus(menusResult.data || [])
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
      if (!isSuperadmin && userBranch) {
        setBranchId(userBranch)
      }
    } else if (hasHydrated && !accountId) {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, hasHydrated, isSuperadmin, userBranch])

  // Fetch recipes and categories when branchId changes
  useEffect(() => {
    const fetchBranchData = async () => {
      if (!branchId || !accountId) {
        setRecipes([])
        setCategories([])
        setRecipeId("")
        setCategoryId("")
        return
      }
      setLoadingRecipes(true)
      setLoadingCategories(true)
      try {
        const [recipesResult, categoriesResult] = await Promise.all([
          getBranchRecipesAction(branchId, accountId),
          getBranchCategoriesAction(branchId, accountId)
        ])
        if (recipesResult.success) {
          setRecipes(recipesResult.data || [])
          setRecipeId("") // Reset valid recipe selected
        }
        if (categoriesResult.success) {
          setCategories(categoriesResult.data || [])
          setCategoryId("")
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingRecipes(false)
        setLoadingCategories(false)
      }
    }

    fetchBranchData()
  }, [branchId, accountId])

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !branchId || !accountId) return
    setSubmitting(true)
    const result = await addMenuCategoryAction(accountId, branchId, newCategoryName)
    if (result.success) {
      setCategories([...categories, result.data])
      setCategoryId(result.data._id)
      setIsAddingCategory(false)
      setNewCategoryName("")
    } else {
      setError(result.message)
    }
    setSubmitting(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !branchId || !categoryId || !recipeId || price === "") {
      setError("Semua field wajib diisi!")
      return
    }

    if (Number(price) < 0) {
      setError("Harga tidak boleh negatif!")
      return
    }

    setSubmitting(true)
    setError("")

    const result = await addMenuAction(accountId, branchId, categoryId, recipeId, name, Number(price), taxIncluded)
    if (result.success) {
      setName("")
      setBranchId("")
      setCategoryId("")
      setRecipeId("")
      setPrice("")
      setTaxIncluded(false)
      setRecipes([])
      setCategories([])
      loadData()
    } else {
      setError(result.message)
    }
    setSubmitting(false)
  }

  if (!hasHydrated || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin w-10 h-10 text-emerald-600" />
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
              <Link href="/admin-dashboard" className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
                &larr; Back to Dashboard
              </Link>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Manage Menu</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Kelola daftar produk/menu dan harganya per cabang.</p>
          </div>
          <div className="h-14 w-14 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transform rotate-3">
            <Utensils size={28} />
          </div>
        </header>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Tambah Menu Baru</h2>
          {error && <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {isSuperadmin && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pilih Cabang</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
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
                    <p className="text-xs text-emerald-500 mt-1">
                      Anda belum membuat Cabang. <Link href="/admin-dashboard/manage-branch" className="underline font-bold">Buat sekarang</Link>.
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pilih Kategori</label>
                  {loadingCategories && <Loader2 className="animate-spin w-3 h-3 text-emerald-500" />}
                </div>
                {!isAddingCategory ? (
                  <div className="flex gap-2">
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none disabled:opacity-50"
                      required
                      disabled={!branchId || loadingCategories}
                    >
                      <option value="" disabled className="dark:bg-slate-900">Pilih Kategori</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id} className="dark:bg-slate-900">
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={() => setIsAddingCategory(true)} disabled={!branchId} className="px-4 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50 flex items-center justify-center shrink-0">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Kategori baru..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                    <button type="button" onClick={handleAddCategory} disabled={submitting} className="px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-medium text-sm disabled:opacity-50">
                      Simpan
                    </button>
                    <button type="button" onClick={() => setIsAddingCategory(false)} disabled={submitting} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition font-medium text-sm disabled:opacity-50 text-slate-700 dark:text-slate-200">
                      Batal
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pilih Resep (Recipe)</label>
                  {loadingRecipes && <Loader2 className="animate-spin w-3 h-3 text-emerald-500" />}
                </div>
                <select
                  value={recipeId}
                  onChange={(e) => setRecipeId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none disabled:opacity-50"
                  required
                  disabled={!branchId || loadingRecipes}
                >
                  <option value="" disabled className="dark:bg-slate-900">Pilih Resep</option>
                  {recipes.map((r) => (
                    <option key={r._id} value={r._id} className="dark:bg-slate-900">
                      {r.name}
                    </option>
                  ))}
                </select>
                {branchId && recipes.length === 0 && !loadingRecipes && (
                  <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                    Cabang ini belum memiliki resep.
                    <Link href="/admin-dashboard/manage-recipe" className="underline font-bold text-emerald-600">Buat Resep</Link>.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Menu (Tampil di POS)</label>
                <input
                  type="text"
                  placeholder="Contoh: Es Kopi Susu Aren (Large)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Harga Jual (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 25000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Harga Termasuk Pajak? (Tax Included)</label>
                <select
                  value={taxIncluded ? "yes" : "no"}
                  onChange={(e) => setTaxIncluded(e.target.value === "yes")}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
                  required
                >
                  <option value="no" className="dark:bg-slate-900">Tidak (Belum Termasuk Pajak)</option>
                  <option value="yes" className="dark:bg-slate-900">Ya (Sudah Termasuk Pajak)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={submitting || !branchId || !recipeId}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>Simpan Menu</span>
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Daftar Menu Tersedia</h2>
            <button onClick={loadData} className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm font-medium transition-colors">
              <RefreshCw size={16} /> <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(isSuperadmin ? menus : menus.filter(m => m.branchId?._id === userBranch || m.branchId === userBranch)).length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                Belum ada menu yang terdaftar untuk cabang ini.
              </div>
            ) : (
              (isSuperadmin ? menus : menus.filter(m => m.branchId?._id === userBranch || m.branchId === userBranch)).map((menu) => (
                <div
                  key={menu._id}
                  className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all hover:border-emerald-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500 to-transparent opacity-10 group-hover:opacity-20 rounded-bl-full transition-opacity" />

                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                      <Utensils size={24} />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                        Rp {menu.price.toLocaleString('id-ID')}
                      </div>
                      {menu.taxIncluded && (
                         <div className="text-[10px] uppercase font-bold text-slate-400">
                           Tax Inc.
                         </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">{menu.name}</h3>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-4">
                    Cabang: {menu.branchId?.name || "Unknown Branch"}
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl flex items-center gap-2 mt-4">
                    <BookOpen size={16} className="text-slate-400 shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      {menu.categoryId?.name && (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">
                          {menu.categoryId.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
