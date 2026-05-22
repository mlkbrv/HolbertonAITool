import { useState, useEffect } from 'react';
import { Paperclip, Send, Sparkles, User, BrainCircuit } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useCart } from '../contexts/CartContext';
import { api, ChatMessage, DetectiveSession, PersonalityProfile, unwrapList } from '../api/client';

export function GiftDetectiveView() {
  const { t } = useLanguage();
  const { navigate, showToast, openPanel } = useNavigation();
  const { addItem } = useCart();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSession] = useState<DetectiveSession | null>(null);
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    api.detectiveActive()
      .then((s) => {
        setSession(s);
        setMessages(s.messages);
        return api.profiles(s.recipient.id);
      })
      .then((data) => {
        const list = unwrapList(data);
        if (list[0]) setProfile(list[0]);
      })
      .catch(() => {
        setMessages([
          { id: 1, role: 'ai', text: t('detective.msg1'), time_label: '10:02 AM', options: [] },
          { id: 2, role: 'user', text: t('detective.msg2'), time_label: '10:03 AM', options: [] },
          { id: 3, role: 'ai', text: t('detective.msg3'), time_label: '10:04 AM', options: [t('detective.opt1'), t('detective.opt2')] },
        ]);
      });
  }, [t]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const text = inputValue;
    setInputValue('');
    if (!session) {
      setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text, time_label: 'Just now', options: [] }]);
      return;
    }
    try {
      const newMsgs = await api.sendMessage(session.id, text);
      setMessages((prev) => [...prev, ...newMsgs]);
    } catch {
      setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text, time_label: 'Just now', options: [] }]);
    }
  };

  const topMatch = profile?.top_match?.gift_set;

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full flex flex-col md:flex-row overflow-hidden bg-soft-cream/40">
      
      {/* Left Chat Area */}
      <section className="flex-1 flex flex-col border-r border-outline-variant/10 relative h-full">
        {/* Header */}
        <div className="px-8 py-6 flex flex-wrap gap-4 justify-between items-center bg-white/60 border-b border-outline-variant/10 backdrop-blur-md sticky top-0 z-20">
          <div>
            <h2 className="text-3xl font-serif font-bold text-primary">{t('detective.title')}</h2>
            <p className="text-sm font-semibold text-on-surface-variant font-sans mt-1">{t('detective.session')}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-tertiary-fixed rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-ai-glow animate-pulse"></span>
            <span className="text-xs font-semibold text-on-tertiary-fixed">{t('detective.live')}</span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-grow overflow-y-auto px-6 md:px-12 py-8 space-y-6 custom-scrollbar pb-32">
          {messages.map(msg => (
             <div key={msg.id} className={`flex gap-4 max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse ml-auto' : ''}`}>
                
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center overflow-hidden border ${msg.role === 'ai' ? 'bg-primary-container border-transparent' : 'bg-surface-container border-outline-variant/40'}`}>
                  {msg.role === 'ai' ? (
                     <Sparkles className="w-5 h-5 text-ai-glow fill-current" />
                  ) : (
                     <User className="w-5 h-5 text-on-surface-variant" />
                  )}
                </div>

                {/* Bubble */}
                <div className={`p-4 md:p-5 shadow-sm border ${
                    msg.role === 'ai' 
                      ? 'ai-chat-bubble rounded-2xl rounded-tl-none' 
                      : 'bg-white rounded-2xl rounded-tr-none border-outline-variant/10'
                  }`}>
                  <p className="text-base text-on-surface leading-relaxed whitespace-pre-wrap">
                    {/* Simple formatting for bold text in dummy data */}
                    {msg.text.split('**').map((part: string, i: number) => i % 2 === 1 ? <strong key={i} className="font-semibold text-primary">{part}</strong> : part)}
                  </p>
                  
                  {msg.options && (
                     <div className="mt-4 flex flex-wrap gap-2">
                        {msg.options.map((opt: string, i: number) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => { setInputValue(opt); showToast(opt); }}
                            className="px-4 py-2 bg-white/70 hover:bg-white border border-ai-glow/20 hover:border-ai-glow/50 rounded-full text-xs font-semibold text-primary transition-all shadow-sm cursor-pointer"
                          >
                            {opt}
                          </button>
                        ))}
                     </div>
                  )}
                  
                  <p className={`text-xs font-semibold text-on-surface-variant mt-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {msg.time_label}
                  </p>
                </div>
             </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="absolute bottom-0 w-full p-4 md:p-6 bg-white/50 backdrop-blur-xl border-t border-outline-variant/10">
          <div className="relative max-w-4xl mx-auto flex items-center">
            <div className="absolute left-6">
              <BrainCircuit className="w-5 h-5 text-on-surface-variant/60" />
            </div>
            
            <input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-white border border-outline-variant/30 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/10 focus:border-ai-glow py-4 pl-14 pr-32 text-base transition-all placeholder:text-on-surface-variant/40" 
              placeholder={t('detective.placeholder')}
              type="text" 
            />
            
            <div className="absolute right-2 flex items-center gap-1">
              <button type="button" onClick={() => showToast(t('detective.dragdrop'))} className="p-2.5 hover:bg-surface-container-low rounded-xl text-on-surface-variant transition-colors group cursor-pointer">
                <Paperclip className="w-5 h-5 group-hover:text-primary" />
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="bg-accent text-on-accent p-2.5 px-5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
              >
                {t('detective.send')} <Send className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
          <p className="text-center text-xs font-semibold text-on-surface-variant mt-3 opacity-70">
            {t('detective.dragdrop')}
          </p>
        </div>
      </section>

      {/* Right Sidebar: Profile */}
      <section className="w-full md:w-[420px] lg:w-[480px] bg-white border-l border-outline-variant/10 flex flex-col h-full z-10 shrink-0">
         <div className="p-8 flex flex-col h-full overflow-y-auto custom-scrollbar pt-[120px] md:pt-8 bg-surface-container-lowest">
            
            <header className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-3xl font-serif font-bold text-primary">{t('detective.profile')}</h3>
                <button type="button" onClick={() => showToast(t('detective.editBase'))} className="text-secondary text-sm font-semibold hover:underline cursor-pointer">{t('detective.editBase')}</button>
              </div>
              <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                 <div className="h-1.5 bg-background flex-grow rounded-full overflow-hidden shrink-0 basis-1/2">
                   <div className="h-full bg-ai-glow w-[68%] transition-all duration-1000"></div>
                 </div>
                 <span className="text-xs font-bold text-primary tracking-wide">{profile?.confidence_percent ?? 68}% {t('detective.confidence')}</span>
              </div>
            </header>

            {/* Interest Clusters */}
            <div className="glass-effect p-6 rounded-2xl mb-6 bg-soft-cream/30 border-white">
               <div className="flex items-center gap-2 mb-6">
                 <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-secondary" /> {t('detective.clusters')}
                 </h4>
               </div>
               
               <div className="space-y-5">
                  {(profile?.interests ?? []).map((interest) => (
                    <div key={interest.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base text-primary font-medium">{interest.name}</span>
                        <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded">
                          {interest.level === 'high' ? t('detective.high') : interest.level === 'medium' ? t('detective.medium') : t('detective.high')}
                        </span>
                      </div>
                      <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                        <div className="bg-secondary h-full rounded-full" style={{ width: `${interest.score_percent}%` }}></div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Trait & Mood */}
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="p-5 border border-outline-variant/30 rounded-2xl bg-white shadow-sm flex flex-col justify-between">
                 <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 block opacity-70">{t('detective.trait')}</span>
                 <p className="text-2xl font-serif font-bold text-primary">{profile?.trait || t('detective.traitVal')}</p>
               </div>
               <div className="p-5 border border-outline-variant/30 rounded-2xl bg-white shadow-sm flex flex-col justify-between">
                 <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 block opacity-70">{t('detective.mood')}</span>
                 <p className="text-2xl font-serif font-bold text-primary">{profile?.mood || t('detective.moodVal')}</p>
               </div>
            </div>

            {/* AI Top Matches Preview */}
            <div className="mt-auto">
               <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-4">{t('detective.topMatches')}</h4>
               
               <button type="button" onClick={() => navigate('gift-sets')} className="w-full group relative bg-surface-container-low rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-outline-variant/10 cursor-pointer text-left">
                 <div className="h-40 overflow-hidden relative">
                   <img 
                      src={topMatch?.image_url || 'https://images.unsplash.com/photo-1544256428-251d5c2ee0cb?q=80&w=600&auto=format&fit=crop'} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      alt="Recommended Gift" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                   <div className="absolute top-3 right-3 glass px-2 py-1 rounded-lg backdrop-blur-md">
                     <span className="text-xs font-bold text-primary">{profile?.top_match?.match_percent ?? 94}% {t('home.match')}</span>
                   </div>
                 </div>
                 <div className="p-5 bg-white relative z-10 border-t border-outline-variant/10">
                   <h5 className="text-lg font-serif font-bold text-primary">{topMatch?.title || 'The Nordic Morning Set'}</h5>
                   <div className="flex justify-between items-center mt-3">
                     <span className="text-sm font-semibold text-on-surface-variant">${topMatch?.price || '124.00'}</span>
                     <span className="text-sm font-semibold text-secondary hover:underline group-hover:text-primary transition-colors flex items-center gap-1">
                        {t('detective.viewSet')} 
                     </span>
                   </div>
                 </div>
               </button>

               <button
                 type="button"
                 onClick={async () => {
                   if (topMatch?.id) {
                     try {
                       await addItem(topMatch.id);
                       showToast(t('cart.added'));
                       openPanel('cart');
                     } catch (err) {
                       showToast(err instanceof Error ? err.message : t('cart.error'));
                     }
                   } else {
                     navigate('gift-sets');
                   }
                 }}
                 className="w-full mt-6 bg-accent text-on-accent py-4 rounded-xl font-semibold hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2 group shadow-accent/20 cursor-pointer"
               >
                 <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                 {t('detective.finalize')}
               </button>
            </div>
         </div>
      </section>

    </div>
  );
}
