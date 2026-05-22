import { useEffect, useState } from 'react';
import { Footer } from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { PlusCircle, Search, Calendar as CalendarIcon } from 'lucide-react';
import { api, Recipient, unwrapList } from '../api/client';
import { useNavigation } from '../contexts/NavigationContext';

export function NewOccasionView() {
  const { t } = useLanguage();
  const { navigate, showToast } = useNavigation();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [title, setTitle] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [occasionType, setOccasionType] = useState('birthday');
  const [date, setDate] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.recipients().then((d) => setRecipients(unwrapList(d))).catch(() => setRecipients([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;
    try {
      await api.createOccasion({
        title,
        recipient_id: recipientId ? Number(recipientId) : undefined,
        occasion_type: occasionType,
        date,
      });
      setSubmitted(true);
      showToast(t('sidebar.newOccasion'));
      setTitle('');
      setDate('');
      setRecipientId('');
      setTimeout(() => navigate('calendar'), 1500);
    } catch {
      setSubmitted(false);
      showToast('Error — try again');
    }
  };

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

        {submitted && (
          <p className="mb-4 text-sm font-semibold text-secondary">Occasion created successfully.</p>
        )}
        <form className="bg-white border border-outline-variant/20 rounded-3xl p-8 shadow-sm space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-primary mb-2">Who is this for?</label>
            <div className="relative">
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none appearance-none"
              >
                <option value="">Select recipient...</option>
                {recipients.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <Search className="w-5 h-5 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">Occasion title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none"
              placeholder="e.g. Mom's Birthday"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">Occasion Type</label>
            <select
              value={occasionType}
              onChange={(e) => setOccasionType(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none appearance-none"
            >
              <option value="birthday">Birthday</option>
              <option value="anniversary">Anniversary</option>
              <option value="retirement">Retirement</option>
              <option value="milestone">Custom Milestone</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">Date</label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none"
                required
              />
              <CalendarIcon className="w-5 h-5 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button type="submit" className="w-full bg-secondary text-on-secondary font-bold py-4 rounded-xl shadow-md hover:opacity-90 transition-opacity mt-4">
            Create Occasion
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}
