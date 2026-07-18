"use client"
import useGlobalStore from "@/store/global"

import { useRouter } from "next/navigation"
import { User, MonitorSmartphone, Headset, LogOut, } from "lucide-react";

function Content() {
  const router = useRouter()

  const logoutAct = useGlobalStore((state) => state.logout);
  const toAdminLogin = () => router.push("/admin-login");
  const toStaffLogin = () => router.push("/login");
  const toSupport = () => router.push("/support");

  const toLogout = () => {
    logoutAct();
    router.push("/");
  };


  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-28 h-28 rounded-full border-4 border-teal-500 flex items-center justify-center text-5xl font-bold text-teal-500">
            P
          </div>

          <h1 className="mt-8 text-4xl font-bold text-gray-900 text-center">
            Restaurant Login Options
          </h1>
        </div>

        {/* Menu */}
        <div className="grid grid-cols-2 gap-5">

          <MenuCard
            icon={<User size={42} />}
            title="Admin"
            color="text-teal-500"
            act={toAdminLogin}
          />

          <MenuCard
            icon={<MonitorSmartphone size={42} />}
            title="Staff Login"
            color="text-teal-500"
            act={toStaffLogin}
          />

          <MenuCard
            icon={<Headset size={42} />}
            title="Support"
            color="text-teal-500"
            act={toSupport}
          />

          <MenuCard
            icon={<LogOut size={42} />}
            title="Logout"
            color="text-red-500"
            act={toLogout}
          />

        </div>

      </div>
    </main>
  );
}


function MenuCard({ icon, title, color, act }: MenuCardProps) {
  return (
    <button onClick={act} className="h-40 rounded-2xl border-2 border-teal-400 bg-white shadow-lg transition hover:scale-105 hover:shadow-xl active:scale-95 flex flex-col items-center justify-center">
      <div className={color}>{icon}</div>

      <p className={`mt-5 text-3xl font-bold ${color}`}>
        {title}
      </p>
    </button>
  );
}

interface MenuCardProps {
  icon: React.ReactNode;
  title: string;
  color: string;
  act: () => void;
}

export {
  Content
}