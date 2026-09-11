'use client';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  FiSend,
  FiFileText,
  FiPhone,
  FiImage,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiLayers,
  FiGlobe,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi';

type CarouselCardInput = {
  imageUrl: string;
  buttonParameter: string;
  bodyText?: string;
};

type FetchedTemplate = {
  name: string;
  language: string;
  headerFormat: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | null;
  bodyText: string;
  variables: string[];
  isCarousel: boolean;
  cardCount: number;
  carouselCards: any[];
  category: string;
};

export default function Page() {
  const [templates, setTemplates] = useState<FetchedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState('');
  const [phones, setPhones] = useState('');
  const [mediaUrl, setMediaUrl] = useState('https://officialtarun.in/avdmc/nautica.jpeg');
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  // Carousel State
  const [carouselCards, setCarouselCards] = useState<CarouselCardInput[]>([
    {
      imageUrl: 'https://officialtarun.in/avdmc/nautica.jpeg',
      buttonParameter: 'product1',
      bodyText: '',
    },
    {
      imageUrl: 'https://officialtarun.in/avdmc/nautica.jpeg',
      buttonParameter: 'product2',
      bodyText: '',
    },
  ]);
  const [carouselTopParam, setCarouselTopParam] = useState('Tarun');

  useEffect(() => {
    fetch('/api/whatsapp/templates')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.templates.length) {
          setTemplates(d.templates);
          setSelectedKey(`${d.templates[0].name}|${d.templates[0].language}`);
          const init: Record<string, string> = {};
          d.templates[0].variables.forEach((v: string) => (init[v] = ''));
          if (d.templates[0].variables.includes('name')) init['name'] = 'Tarun';
          setParamValues(init);

          if (d.templates[0].isCarousel) {
            const count = Math.max(d.templates[0].cardCount || 2, 2);
            setCarouselCards(
              Array.from({ length: count }).map((_, i) => ({
                imageUrl: 'https://officialtarun.in/avdmc/nautica.jpeg',
                buttonParameter: `item${i + 1}`,
                bodyText: '',
              }))
            );
          }
        } else {
          toast.error('No templates found');
        }
      })
      .catch(() => toast.error('Failed to load templates'))
      .finally(() => setLoading(false));
  }, []);

  const currentTemplate = useMemo(() => {
    if (!selectedKey) return null;
    const [name, lang] = selectedKey.split('|');
    return templates.find((t) => t.name === name && t.language === lang) || null;
  }, [selectedKey, templates]);

  useEffect(() => {
    if (!currentTemplate) return;
    const init: Record<string, string> = {};
    currentTemplate.variables.forEach((v) => (init[v] = paramValues[v] || ''));
    if (currentTemplate.variables.includes('name') && !init['name']) init['name'] = 'Tarun';
    setParamValues(init);

    if (currentTemplate.isCarousel) {
      const count = Math.max(currentTemplate.cardCount || 2, 2);
      setCarouselCards((prev) => {
        if (prev.length === count) return prev;
        return Array.from({ length: count }).map(
          (_, i) =>
            prev[i] || {
              imageUrl: 'https://officialtarun.in/avdmc/nautica.jpeg',
              buttonParameter: `item${i + 1}`,
              bodyText: '',
            }
        );
      });
    }
  }, [currentTemplate?.name, currentTemplate?.language]);

  const sendWhatsApp = async () => {
    if (!currentTemplate) return toast.warning('No template selected');

    const phoneList = phones
      .split(/[\n,]/)
      .map((p) => p.trim().replace(/\D/g, ''))
      .filter(Boolean)
      .map((p) => (p.length === 10 ? `91${p}` : p));

    if (!phoneList.length) return toast.warning('Enter phone numbers');
    if (!currentTemplate.isCarousel && currentTemplate.headerFormat && !mediaUrl)
      return toast.warning(`Media URL required for ${currentTemplate.headerFormat}`);
    if (currentTemplate.isCarousel && carouselCards.some((c) => !c.imageUrl))
      return toast.warning('All carousel cards need Image URL');

    setSending(true);
    setResults([]);
    const toastId = toast.loading('Sending...');

    for (let i = 0; i < phoneList.length; i++) {
      const phone = phoneList[i];

      const parameters = (currentTemplate?.variables || []).map((varName) => {
        const rawVal =
          varName === '1' && currentTemplate.isCarousel
            ? carouselTopParam
            : paramValues[varName] || '';
        const lines = rawVal
          .split(/\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        const text = lines.length === phoneList.length ? lines[i] : lines[0] || rawVal || ' ';
        const isNamed = isNaN(Number(varName));
        return isNamed ? { type: 'text', parameter_name: varName, text } : { type: 'text', text };
      });

      try {
        const res = await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone,
            template: currentTemplate!.name,
            language: currentTemplate!.language,
            htype:
              currentTemplate && !currentTemplate.isCarousel && currentTemplate.headerFormat
                ? currentTemplate.headerFormat.toLowerCase()
                : undefined,
            mediaUrl:
              !currentTemplate!.isCarousel && currentTemplate.headerFormat ? mediaUrl : undefined,
            parameters,
            cards: currentTemplate.isCarousel
              ? carouselCards.map((c) => ({
                  imageUrl: c.imageUrl,
                  buttonParameter: c.buttonParameter,
                  body: c.bodyText,
                }))
              : undefined,
          }),
        });
        const data = await res.json();
        setResults((prev) => [
          ...prev,
          {
            phone,
            status: data.success ? '✅ Sent' : '❌ Failed',
            error: data.response?.error?.message || data.error || '',
          },
        ]);
        data.success ? toast.success(`✅ ${phone}`) : toast.error(`❌ ${phone}`);
      } catch (e: any) {
        setResults((prev) => [...prev, { phone, status: '❌ Failed', error: e.message }]);
      }
    }
    toast.dismiss(toastId);
    toast.success('Completed');
    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex items-center space-x-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100">
          <FiLoader className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-slate-700 font-medium">Loading templates from WhatsApp...</span>
        </div>
      </div>
    );
  }

  if (!currentTemplate) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiXCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">No Approved Templates</h2>
          <p className="text-slate-500 text-sm mt-1">No active templates found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              WhatsApp Business API {currentTemplate.isCarousel && '• CAROUSEL'}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Dynamic Broadcast Center
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {templates.length} templates • WABA ID:{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs text-slate-700 font-mono">
                {process.env.NEXT_PUBLIC_WABA_ID || '1062952783327668'}
              </code>
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 self-start sm:self-auto">
            <FiLayers className="text-slate-400 w-4 h-4" />
            <span className="text-xs font-medium text-slate-600">
              Active: <strong className="text-slate-900">{currentTemplate.name}</strong>{' '}
              {currentTemplate.isCarousel ? `(Carousel - ${currentTemplate.cardCount} cards)` : ''}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 space-y-6">
            <div>
              <label className="block font-semibold text-slate-700 text-sm mb-1.5 flex items-center gap-2">
                <FiFileText className="text-slate-400" /> Select Template
              </label>
              <select
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer"
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
              >
                {templates.map((t) => (
                  <option key={`${t.name}|${t.language}`} value={`${t.name}|${t.language}`}>
                    {t.name} ({t.language.toUpperCase()}){' '}
                    {t.isCarousel ? '• CAROUSEL' : t.headerFormat ? `• ${t.headerFormat}` : ''}{' '}
                    {t.variables.length ? `• ${t.variables.length} vars` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-gradient-to-br from-emerald-50/40 to-slate-50 border border-emerald-100/60 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                <span>Live Preview</span>
                <span className="flex items-center gap-1 text-slate-500 font-normal normal-case">
                  <FiGlobe className="w-3 h-3" /> {currentTemplate.language.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed bg-white/80 p-3.5 rounded-lg border border-emerald-100/40 shadow-2xs">
                {currentTemplate.bodyText || 'No body text.'}
              </p>
              {currentTemplate.isCarousel && (
                <div className="grid grid-cols-1 gap-2 pt-2">
                  {currentTemplate.carouselCards.map((c: any, idx: number) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border text-xs">
                      <span className="font-bold">Card {idx + 1}:</span> {c.bodyText?.slice(0, 80)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!currentTemplate.isCarousel && currentTemplate.headerFormat && (
              <div>
                <label className="block font-semibold text-slate-700 text-sm mb-1.5 flex items-center gap-2">
                  <FiImage className="text-slate-400" /> Header {currentTemplate.headerFormat} URL{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://example.com/media.jpg"
                />
              </div>
            )}

            {currentTemplate.isCarousel && (
              <div className="space-y-4">
                <label className="block font-semibold text-slate-700 text-sm">
                  Top Body Parameter (&#123;&#123;1&#125;&#125;)
                </label>
                <input
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-sm"
                  value={carouselTopParam}
                  onChange={(e) => setCarouselTopParam(e.target.value)}
                  placeholder="e.g. Tarun"
                />

                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-700 text-sm">
                    Carousel Cards
                  </label>
                  <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                    {carouselCards.length}/10 cards
                  </span>
                </div>
                {carouselCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/40"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-700">Card {idx + 1}</p>
                      {carouselCards.length > 2 && (
                        <button
                          onClick={() =>
                            setCarouselCards(carouselCards.filter((_, i) => i !== idx))
                          }
                          className="text-rose-500 hover:text-rose-600"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm"
                      placeholder="Image URL (public https://)"
                      value={card.imageUrl}
                      onChange={(e) => {
                        const copy = [...carouselCards];
                        copy[idx].imageUrl = e.target.value;
                        setCarouselCards(copy);
                      }}
                    />
                    <input
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm"
                      placeholder="Button URL suffix - e.g. product-id / 123"
                      value={card.buttonParameter}
                      onChange={(e) => {
                        const copy = [...carouselCards];
                        copy[idx].buttonParameter = e.target.value;
                        setCarouselCards(copy);
                      }}
                    />
                  </div>
                ))}
                {carouselCards.length < 10 && (
                  <button
                    onClick={() =>
                      setCarouselCards([
                        ...carouselCards,
                        {
                          imageUrl: 'https://officialtarun.in/avdmc/nautica.jpeg',
                          buttonParameter: '',
                        },
                      ])
                    }
                    className="w-full border border-dashed border-slate-300 rounded-xl py-2.5 text-sm text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
                  >
                    <FiPlus /> Add Card
                  </button>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
              <span>
                Type:{' '}
                {currentTemplate.isCarousel ? 'CAROUSEL' : currentTemplate.headerFormat || 'TEXT'}
              </span>
              <span>Variables: {currentTemplate.variables.length}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              {!currentTemplate.isCarousel && currentTemplate.variables.length > 0 && (
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-slate-800 flex items-center justify-between">
                    <span>Template Parameters</span>
                    <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Dynamic
                    </span>
                  </div>
                  {currentTemplate.variables.map((v) => (
                    <div key={v} className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-700">
                        Variable{' '}
                        <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono">
                          {'{{'}
                          {v}
                          {'}}'}
                        </code>
                      </label>
                      <textarea
                        rows={2}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-slate-800 text-sm resize-none"
                        value={paramValues[v] || ''}
                        onChange={(e) =>
                          setParamValues((prev) => ({ ...prev, [v]: e.target.value }))
                        }
                        placeholder={v === 'name' ? 'Tarun\nAmit\nRahul' : `Value for ${v}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 text-sm mb-1.5 flex items-center gap-2">
                  <FiPhone className="text-slate-400" /> Phone Numbers{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-slate-800 text-sm font-mono"
                  value={phones}
                  onChange={(e) => setPhones(e.target.value)}
                  placeholder="7999267389&#10;9876543210"
                />
                <p className="text-xs text-slate-400 mt-1">Comma or new line separated.</p>
              </div>
            </div>

            <button
              onClick={sendWhatsApp}
              disabled={sending}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl py-3.5 px-4 shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  <span>Broadcasting...</span>
                </>
              ) : (
                <>
                  <FiSend className="w-4 h-4" />
                  <span>Send {currentTemplate.name}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-800">Broadcast Logs</h3>
              <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-full">
                Total: {results.length}
              </span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {results.map((r, i) => {
                const isSuccess = r.status.includes('Sent');
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex items-center justify-between text-sm ${isSuccess ? 'bg-emerald-50/30 border-emerald-100' : 'bg-rose-50/30 border-rose-100'}`}
                  >
                    <div className="flex items-center gap-2.5 font-mono">
                      {isSuccess ? (
                        <FiCheckCircle className="text-emerald-600" />
                      ) : (
                        <FiXCircle className="text-rose-600" />
                      )}
                      <span>{r.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span
                        className={`font-medium px-2 py-0.5 rounded-md ${isSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}
                      >
                        {r.status}
                      </span>
                      {r.error && (
                        <span className="text-rose-500 max-w-xs truncate">{r.error}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}