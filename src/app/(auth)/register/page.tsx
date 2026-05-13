import Link from 'next/link'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default function Register({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  const signUp = async (formData: FormData) => {
    'use server'

    const origin = headers().get('origin')
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      return redirect('/register?message=Could not authenticate user')
    }

    return redirect('/register?message=Check email to continue sign in process')
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
        action={signUp}
      >
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-900">Kayıt Ol</h1>
        <p className="text-sm text-gray-600 mb-6">
          Araştır platformuna katılın ve rapor oluşturmaya başlayın.
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
          minLength={6}
        />
        
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md px-4 py-2 transition-colors mb-2">
          Kayıt Ol
        </button>

        {searchParams?.message && (
          <p className="mt-4 p-4 bg-blue-50 text-blue-800 text-center text-sm rounded-md border border-blue-100">
            {searchParams.message}
          </p>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
            Giriş Yapın
          </Link>
        </div>
      </form>
    </div>
  )
}
