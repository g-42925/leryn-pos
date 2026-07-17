"use client"
import useGlobalStore from "@/store/global"
import { useRouter } from "next/navigation"
import { User, MonitorSmartphone, LogOut, ArrowRight, Store } from "lucide-react";

function Content() {
  const router = useRouter()
  const logoutAct = useGlobalStore((state) => state.logout);

  const toAdminLogin = () => router.push("/admin-login");
  const toStaffLogin = () => router.push("/staff-login");

  const toLogout = () => {
    logoutAct();
    router.push("/");
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-50 selection:bg-teal-500 selection:text-white">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-400/20 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[50%] rounded-full bg-emerald-400/20 blur-[120px]" />
      </div>

      <div className="w-full max-w-5xl px-6 relative z-10 flex flex-col items-center">
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-16">
          <div className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-4xl font-extrabold text-white shadow-2xl shadow-teal-500/30 ring-4 ring-white">
            P
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight text-center mb-3">
            Leryn <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">POS</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium">Select your portal to continue</p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          <MenuCard
            icon={<User size={32} className="text-teal-600" />}
            title="Admin Login"
            description="Manage settings, staff, and overall performance."
            hoverBorder="hover:border-teal-400"
            hoverBg="hover:bg-teal-50/50"
            iconBg="bg-teal-50"
            act={toAdminLogin}
          />

          <MenuCard
            icon={<MonitorSmartphone size={32} className="text-emerald-600" />}
            title="Staff Login"
            description="Access your assigned branch and handle orders."
            hoverBorder="hover:border-emerald-400"
            hoverBg="hover:bg-emerald-50/50"
            iconBg="bg-emerald-50"
            act={toStaffLogin}
          />

          <MenuCard
            icon={<LogOut size={32} className="text-rose-600" />}
            title="Logout"
            description="Securely sign out of the current session."
            hoverBorder="hover:border-rose-400"
            hoverBg="hover:bg-rose-50/50"
            iconBg="bg-rose-50"
            act={toLogout}
          />
        </div>
      </div>
    </main>
  );
}

interface MenuCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  hoverBorder: string;
  hoverBg: string;
  iconBg: string;
  act: () => void;
}

function MenuCard({ icon, title, description, hoverBorder, hoverBg, iconBg, act }: MenuCardProps) {
  return (
    <button 
      onClick={act} 
      className={`group relative text-left p-8 rounded-3xl bg-white border-2 border-slate-100 shadow-lg shadow-slate-200/50 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-300/60 active:translate-y-0 active:scale-[0.98] ${hoverBorder} ${hoverBg}`}
    >
      <div className={`w-16 h-16 rounded-2xl ${iconBg} border border-white flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
        {icon}
      </div>
      
      <h3 className="text-2xl font-bold text-slate-800 mb-2 transition-colors">
        {title}
      </h3>
      
      <p className="text-slate-500 font-medium leading-relaxed mb-8 md:h-12">
        {description}
      </p>

      <div className="flex items-center text-sm font-bold text-slate-400 group-hover:text-slate-800 transition-colors mt-auto">
        Continue 
        <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-2 transition-transform duration-300" />
      </div>
    </button>
  );
}

export {
  Content
}