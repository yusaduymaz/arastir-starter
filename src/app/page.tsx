import Link from 'next/link'
import { Activity, ArrowRight, BarChart3, Search, FileText } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 text-white p-2 rounded-lg">
                  <Activity size={20} />
                </div>
                <span className="font-bold text-xl text-gray-900 tracking-tight">Araştır</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Giriş Yap
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
              >
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out-expo">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Yapay Zeka Destekli <br className="hidden sm:block" /> Finansal Araştırma Asistanı
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Şirketlerin KAP bildirimlerini ve güncel finansal haberlerini saniyeler içinde tarayın. Duygu analiziyle desteklenmiş, PDF ve PPTX formatında hazır raporlar elde edin.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium px-8 py-3 rounded-lg transition-colors"
            >
              Hemen Başla <ArrowRight size={18} />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 text-base font-medium px-8 py-3 border border-gray-200 rounded-lg transition-colors"
            >
              Sisteme Giriş
            </Link>
          </div>
        </div>

        <div className="mt-20 grid sm:grid-cols-3 gap-8 max-w-5xl w-full animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out-expo delay-150 fill-mode-both text-left">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="bg-blue-50 w-12 h-12 flex items-center justify-center rounded-lg text-blue-600 mb-4">
              <Search size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Derinlemesine Tarama</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              KAP bildirimlerini ve güvenilir finans haber kaynaklarını (Bloomberg HT, Ekonomim) otomatik olarak tarayarak verileri bir araya getirir.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="bg-blue-50 w-12 h-12 flex items-center justify-center rounded-lg text-blue-600 mb-4">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Duygu Analizi</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Toplanan haber ve bildirimleri NLP teknikleriyle işleyerek finansal bağlamda pozitif, negatif veya nötr olarak sınıflandırır.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="bg-blue-50 w-12 h-12 flex items-center justify-center rounded-lg text-blue-600 mb-4">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hazır Raporlar</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Elde edilen tüm verileri profesyonel ve sunuma hazır PDF veya PPTX formatında saniyeler içinde kullanımınıza sunar.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Araştır Projesi. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  )
}
