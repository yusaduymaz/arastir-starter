import Link from 'next/link'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default function Login({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  const signIn = async (formData: FormData) => {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return redirect(`/login?message=${encodeURIComponent(error.message)}`)
    }

    return redirect('/dashboard')
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Geri
      </Link>

      <form
        className="animate-in fade-in zoom-in-95 duration-500 flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
        action={signIn}
      >
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-900">Giriş Yap</h1>
        <p className="text-sm text-gray-600 mb-6">
          Araştır platformuna hoş geldiniz. Lütfen bilgilerinizi girin.
        </p>

        <label className="text-sm font-medium text-gray-900 mb-1" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all mb-4"
          name="email"
          placeholder="sizin@sirketiniz.com"
          required
        />
        <label className="text-sm font-medium text-gray-900 mb-1" htmlFor="password">
          Şifre
        </label>
        <input
          className="rounded-md px-4 py-2 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all mb-6"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md px-4 py-2 transition-colors mb-2">
          Giriş Yap
        </button>

        {searchParams?.message && (
          <p className="mt-4 p-4 bg-red-50 text-red-600 text-center text-sm rounded-md border border-red-100">
            {searchParams.message}
          </p>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          Hesabınız yok mu?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
            Kayıt Olun
          </Link>
        </div>
      </form>
    </div>
  )
}
