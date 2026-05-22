import { Footer } from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { PlusCircle, Search, Calendar as CalendarIcon } from 'lucide-react';

export function NewOccasionView() {
  const { t } = useLanguage();

  return (
    <>
      <div className="max-w-[800px] mx-auto px-6 pb-16 pt-8">
        <header className="mb-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
            <PlusCircle className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary">{t('sidebar.newOccasion')}</h1>
            <p className="text-base text-on-surface-variant">Add a new event to track.</p>
          </div>
        </header>

        <form className="bg-white border border-outline-variant/20 rounded-3xl p-8 shadow-sm space-y-6" onSubmit={e => e.preventDefault()}>
          <div>
            <label className="block text-sm font-bold text-primary mb-2">Who is this for?</label>
            <div className="relative">
              <input type="text" className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none" placeholder="Name or Profile..." />
              <Search className="w-5 h-5 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">Occasion Type</label>
            <select className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none appearance-none">
              <option>Birthday</option>
              <option>Anniversary</option>
              <option>Retirement</option>
              <option>Custom Milestone</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">Date</label>
            <div className="relative">
              <input type="date" className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none" />
               <CalendarIcon className="w-5 h-5 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button className="w-full bg-secondary text-on-secondary font-bold py-4 rounded-xl shadow-md hover:opacity-90 transition-opacity mt-4">
            Create Occasion
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}
