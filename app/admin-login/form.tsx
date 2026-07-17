"use client"

import useGlobalStore from "@/store/global"
import { useRouter } from 'next/navigation'
import { useFormAction } from "@/hooks/useFormAction";
import { adminLoginAction, FormState, LoginResponse } from "@/app/actions/admin-login";

function Form() {
  const router = useRouter()
  const accountId = useGlobalStore((s) => s.accountId)
  const adminLogin = useGlobalStore((s) => s.adminLogin)

  const _login = useFormAction(adminLoginAction, {
    onSuccess: (state: FormState<LoginResponse>) => {
      const result = {
        accountId: state.result?.accountId as string,
        role: state.result?.role as string,
        permission: state.result?.permissions as string[],
        branch: state.result?.branch as string,
      }

      adminLogin(result)

      router.push("/admin-dashboard")
    }
  })

  return (
    <form action={_login.formAction} className="min-h-screen bg-slate-50 flex flex-col gap-4 justify-center items-center p-4">
      <div className="w-full max-w-sm md:max-w-3xl lg:max-w-4xl xl:w-2/3 md:min-h-[500px] lg:h-[600px] flex flex-col md:flex-row shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden bg-white ring-1 ring-slate-900/5">
        {/* Left Side Branding */}
        <div className="text-white flex flex-col text-center p-8 lg:p-12 justify-center items-center w-full md:w-2/5 lg:w-1/2 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 relative xl:overflow-hidden overflow-visible">
          {/* Decorative graphic background */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="bg-white/10 p-4 rounded-full mb-6 relative z-10 shadow-xl ring-1 ring-white/20 backdrop-blur-md">
            <svg className="w-12 h-12 lg:w-16 lg:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>

          <span className="font-extrabold text-3xl lg:text-4xl mb-4 tracking-tight drop-shadow-md z-10">Admin Portal</span>
          <span className="text-sm lg:text-base text-slate-300 px-2 lg:px-6 leading-relaxed z-10 font-medium">
            Manage your Leryn POS system, configure settings, and oversee operations.
          </span>
        </div>

        {/* Right Side Login Form */}
        <div className="w-full md:w-3/5 lg:w-1/2 flex flex-col justify-center p-8 lg:p-14 gap-6 lg:gap-8 bg-white relative z-10">
          <div className="hidden md:flex flex-col gap-2">
            <span className="font-bold text-2xl lg:text-3xl text-slate-800">Admin Authentication</span>
            <span className="text-sm text-slate-500 font-medium">Sign in to access the administrator dashboard.</span>
          </div>

          <div className="flex flex-col gap-5">
            <div className="group hidden">
              <label className="block text-slate-600 text-sm font-bold mb-2 transition-colors group-focus-within:text-slate-900">Account ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
                </div>
                <input
                  type="text"
                  className="text-slate-900 w-full border-2 border-slate-200 rounded-xl focus:border-slate-800 focus:ring-4 focus:ring-slate-800/10 outline-none py-3.5 pl-12 pr-4 transition-all bg-slate-50 focus:bg-white placeholder:text-slate-400 font-medium"
                  name="accountId"
                  value={accountId}
                  readOnly
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-slate-600 text-sm font-bold mb-2 transition-colors group-focus-within:text-slate-900">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <input
                  type="text"
                  className="text-slate-900 w-full border-2 border-slate-200 rounded-xl focus:border-slate-800 focus:ring-4 focus:ring-slate-800/10 outline-none py-3.5 pl-12 pr-4 transition-all bg-slate-50 focus:bg-white placeholder:text-slate-400 font-medium"
                  name="username"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-slate-600 text-sm font-bold mb-2 transition-colors group-focus-within:text-slate-900">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <input
                  type="password"
                  className="text-slate-900 w-full border-2 border-slate-200 rounded-xl focus:border-slate-800 focus:ring-4 focus:ring-slate-800/10 outline-none py-3.5 pl-12 pr-4 transition-all bg-slate-50 focus:bg-white placeholder:text-slate-400 font-medium"
                  name="password"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="group p-4 mt-2 rounded-xl bg-slate-800 hover:bg-slate-900 shadow-xl shadow-slate-800/30 text-white font-bold transition-all w-full flex justify-center items-center gap-2 active:scale-[0.98]">
            Secure Login
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>
    </form>
  );
}

export {
  Form
}
