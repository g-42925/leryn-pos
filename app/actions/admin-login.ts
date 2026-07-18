"use server"

import bcrypt from "bcrypt"

import { cookies } from "next/headers"
import { admin } from "@/model/admin"
import { connectToDatabase } from "@/lib/mongodb"

export interface FormState<T> {
  success: boolean
  message: string
  result?: T
}

export interface LoginResponse {
  _id: string
  accountId: string
  password: string,
  username: string
}
async function adminLoginAction<T>(prevState: FormState<T>, formData: FormData): Promise<FormState<T>> {
  try {
    await connectToDatabase()

    const uname = formData.get("username") as string
    const accountId = formData.get("accountId") as string
    const password = formData.get("password") as string

    console.log("===============================")
    console.log({ accountId, uname, password })
    console.log("===============================")

    if (!uname || !password) return {
      success: false,
      message: "Credential tidak boleh kosong",
    }

    const r = await admin.findOne({ username: uname }).lean()

    if (!r) return {
      success: false,
      message: "User tidak ditemukan",
    }

    const isPasswordValid = await bcrypt.compare(password, r.password)

    if (!isPasswordValid) return {
      success: false,
      message: "Password salah!",
    }

    const cookieStore = await cookies()
    cookieStore.set("admin_session_token", "contoh-token-jwt-rahasia", {
      httpOnly: true, // Ambil dari server saja, aman dari XSS
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 hari
      path: "/",
    })


    const result = {
      ...r,
      _id: r._id.toString()
    }

    return {
      success: true,
      message: "Login berhasil!",
      result: result as T
    }
  }
  catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "",
    }
  }
}

export { adminLoginAction }