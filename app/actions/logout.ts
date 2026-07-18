'use server'

import { cookies } from 'next/headers'

async function deleteAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('session_token')
}

export {
  deleteAuthCookie
}