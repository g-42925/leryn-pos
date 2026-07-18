"use client"

import useGlobalStore from "@/store/global"
import { redirect } from "next/navigation"
import { useFormAction } from "@/hooks/useFormAction";
import { loginAction, FormState, LoginResponse } from "@/app/actions/login";

function Form() {
  const login = useGlobalStore((s) => s.login)

  const _login = useFormAction(loginAction, {
    onSuccess: (state: FormState<LoginResponse>) => {
      login({ accountId: state.result?._id as string })
      redirect("/home")
    }
  })

  return (
    <form action={_login.formAction} className="min-h-screen bg-slate-50 flex flex-col gap-4 justify-center items-center p-4">
      <div className="w-full max-w-sm md:max-w-3xl lg:max-w-4xl xl:w-2/3 md:min-h-[500px] lg:h-[600px] flex flex-col md:flex-row shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden bg-white ring-1 ring-slate-900/5">
        {/* Left Side Branding */}
        <div className="text-white flex flex-col text-center p-8 lg:p-12 justify-center items-center w-full md:w-2/5 lg:w-1/2 bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-800 relative xl:overflow-hidden overflow-visible">
          {/* Decorative graphic background */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="bg-white/20 p-4 rounded-full mb-6 relative z-10 shadow-xl ring-1 ring-white/30 backdrop-blur-md">
            <svg className="w-12 h-12 lg:w-16 lg:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {/* Shopping cart POS icon */}
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>

          <span className="font-extrabold text-3xl lg:text-4xl mb-4 tracking-tight drop-shadow-md z-10">Leryn POS</span>
          <span className="text-sm lg:text-base text-blue-100 px-2 lg:px-6 leading-relaxed z-10 font-medium">
            Manage your sales, track inventory, and serve your customers seamlessly.
          </span>
        </div>

        {/* Right Side Login Form */}
        <div className="w-full md:w-3/5 lg:w-1/2 flex flex-col justify-center p-8 lg:p-14 gap-6 lg:gap-8 bg-white relative z-10">
          <div className="hidden md:flex flex-col gap-2">
            <span className="font-bold text-2xl lg:text-3xl text-slate-800">Restaurant Login</span>
            <span className="text-sm text-slate-500 font-medium">Sign in to access your point of sale dashboard.</span>
          </div>

          <div className="flex flex-col gap-5">
            <div className="group">
              <label className="block text-slate-600 text-sm font-bold mb-2 transition-colors group-focus-within:text-blue-600">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                </div>
                <input
                  type="text"
                  className="text-slate-900 w-full border-2 border-slate-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none py-3.5 pl-12 pr-4 transition-all bg-slate-50 focus:bg-white placeholder:text-slate-400 font-medium"
                  name="email"
                  placeholder="cashier@store.com"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-slate-600 text-sm font-bold mb-2 transition-colors group-focus-within:text-blue-600">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <input
                  type="password"
                  className="text-slate-900 w-full border-2 border-slate-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none py-3.5 pl-12 pr-4 transition-all bg-slate-50 focus:bg-white placeholder:text-slate-400 font-medium"
                  name="password"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="group p-4 mt-4 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/30 text-white font-bold transition-all w-full flex justify-center items-center gap-2 active:scale-[0.98]">
            Sign Into POS
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>
      </div>
    </form>
  );
}

export {
  Form
}