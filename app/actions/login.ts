"use server"

import bcrypt from "bcrypt"

import { cookies } from "next/headers"
import { account } from "@/model/account"
import { connectToDatabase } from "@/lib/mongodb"

export interface FormState<T> {
  success: boolean
  message: string
  result?: T
}

export interface LoginResponse {
  _id: string
  email: string
  password: string
}

export async function loginAction<T>(prevState: FormState<T>, formData: FormData): Promise<FormState<T>> {
  try {
    await connectToDatabase()

    if (!formData.get("email") || !formData.get("password")) return {
      success: false,
      message: "Email dan password wajib diisi!",
    }

    const user = await account.findOne({ email: formData.get("email") as string }).lean()

    if (!user) return {
      success: false,
      message: "Email tidak terdaftar!",
    }

    const isPasswordValid = await bcrypt.compare(formData.get("password") as string, user.password)

    if (!isPasswordValid) return {
      success: false,
      message: "Password salah!",
    }

    const cookieStore = await cookies()
    cookieStore.set("session_token", "contoh-token-jwt-rahasia", {
      httpOnly: true, // Ambil dari server saja, aman dari XSS
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 hari
      path: "/",
    })

    const result = {
      ...user,
      _id: user._id.toString()
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