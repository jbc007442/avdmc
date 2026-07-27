// 'use client';
// import { useEffect, useState, useMemo } from 'react';
// import { toast } from 'react-toastify';

// type FetchedTemplate = {
//   name: string;
//   language: string;
//   headerFormat: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | null;
//   bodyText: string;
//   variables: string[]; // ['name'] or ['1','2']
// };

// export default function Page() {
//   const [templates, setTemplates] = useState<FetchedTemplate[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedKey, setSelectedKey] = useState(''); // name|language
//   const [phones, setPhones] = useState('');
//   const [mediaUrl, setMediaUrl] = useState(
//     'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLHNePLFGX8ZZ_bTYC5dBzK8OLp_IKipXZ8XMdsbem1A&s=10'
//   );
//   const [paramValues, setParamValues] = useState<Record<string, string>>({});
//   const [sending, setSending] = useState(false);
//   const [results, setResults] = useState<any[]>([]);

//   // 1. Fetch from your new API
//   useEffect(() => {
//     fetch('/api/whatsapp/templates')
//       .then((r) => r.json())
//       .then((d) => {
//         if (d.success && d.templates.length) {
//           setTemplates(d.templates);
//           setSelectedKey(`${d.templates[0].name}|${d.templates[0].language}`);
//           // init param values
//           const init: Record<string, string> = {};
//           d.templates[0].variables.forEach((v: string) => (init[v] = ''));
//           if (d.templates[0].variables.includes('name')) init['name'] = 'Tarun';
//           setParamValues(init);
//         } else {
//           toast.error('No templates found');
//         }
//       })
//       .catch(() => toast.error('Failed to load templates'))
//       .finally(() => setLoading(false));
//   }, []);

//   const currentTemplate = useMemo(() => {
//     if (!selectedKey) return null;
//     const [name, lang] = selectedKey.split('|');
//     return templates.find((t) => t.name === name && t.language === lang) || null;
//   }, [selectedKey, templates]);

//   // When template changes, reset param inputs
//   useEffect(() => {
//     if (!currentTemplate) return;
//     const init: Record<string, string> = {};
//     currentTemplate.variables.forEach((v) => (init[v] = paramValues[v] || ''));
//     // default for welcome_avdmc
//     if (currentTemplate.variables.includes('name') && !init['name']) init['name'] = 'Tarun';
//     setParamValues(init);
//   }, [currentTemplate?.name, currentTemplate?.language]);

//   const sendWhatsApp = async () => {
//     const phoneList = phones
//       .split(/[\n,]/)
//       .map((p) => p.trim().replace(/\D/g, ''))
//       .filter(Boolean)
//       .map((p) => (p.length === 10 ? `91${p}` : p));

//     if (!phoneList.length) return toast.warning('Enter phone numbers');
//     if (currentTemplate?.headerFormat && !mediaUrl)
//       return toast.warning(`Media URL required for ${currentTemplate.headerFormat}`);

//     setSending(true);
//     setResults([]);
//     const toastId = toast.loading('Sending...');

//     for (let i = 0; i < phoneList.length; i++) {
//       const phone = phoneList[i];

//       // Build params per phone - supports bulk (one value per line)
//       const parameters = (currentTemplate?.variables || []).map((varName) => {
//         const rawVal = paramValues[varName] || '';
//         const lines = rawVal
//           .split(/\n/)
//           .map((l) => l.trim())
//           .filter(Boolean);
//         const text = lines.length === phoneList.length ? lines[i] : lines[0] || rawVal || ' ';
//         const isNamed = isNaN(Number(varName));
//         if (isNamed) {
//           return { type: 'text', parameter_name: varName, text };
//         } else {
//           return { type: 'text', text };
//         }
//       });

//       try {
//         const res = await fetch('/api/whatsapp/send', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             phone,
//             template: currentTemplate!.name,
//             language: currentTemplate!.language,
//             htype: currentTemplate!.headerFormat
//               ? currentTemplate!.headerFormat.toLowerCase()
//               : undefined,
//             mediaUrl: currentTemplate!.headerFormat ? mediaUrl : undefined,
//             parameters,
//           }),
//         });
//         const data = await res.json();
//         setResults((prev) => [
//           ...prev,
//           {
//             phone,
//             status: data.success ? '✅ Sent' : '❌ Failed',
//             error: data.response?.error?.message || data.error || '',
//           },
//         ]);
//         data.success ? toast.success(`✅ ${phone}`) : toast.error(`❌ ${phone}`);
//       } catch (e: any) {
//         setResults((prev) => [...prev, { phone, status: '❌ Failed', error: e.message }]);
//       }
//     }
//     toast.dismiss(toastId);
//     toast.success('Completed');
//     setSending(false);
//   };

//   if (loading) return <div className="p-10">Loading templates from WhatsApp...</div>;
//   if (!currentTemplate) return <div className="p-10">No approved templates found</div>;

//   return (
//     <div className="max-w-5xl mx-auto p-6">
//       <div className="bg-white border rounded-2xl shadow-sm p-8">
//         <h1 className="text-2xl font-bold">WhatsApp Sender - Dynamic</h1>
//         <p className="text-zinc-500 text-sm mb-6">
//           {templates.length} templates loaded from WABA{' '}
//           {process.env.WHATSAPP_WABA_ID || '1062952783327668'}
//         </p>

//         <div className="grid md:grid-cols-2 gap-6">
//           <div className="space-y-4">
//             <div>
//               <label className="font-medium text-sm">Template</label>
//               <select
//                 className="w-full border rounded-xl p-3 mt-1"
//                 value={selectedKey}
//                 onChange={(e) => setSelectedKey(e.target.value)}
//               >
//                 {templates.map((t) => (
//                   <option key={`${t.name}|${t.language}`} value={`${t.name}|${t.language}`}>
//                     {t.name} ({t.language}) {t.headerFormat ? `+ ${t.headerFormat}` : ''}{' '}
//                     {t.variables.length ? `- ${t.variables.length} vars` : ''}
//                   </option>
//                 ))}
//               </select>
//               <div className="text-xs bg-zinc-50 p-3 mt-2 rounded-xl">
//                 <b>Preview:</b> {currentTemplate.bodyText || 'No body text'}
//               </div>
//             </div>

//             {currentTemplate.headerFormat && (
//               <div>
//                 <label className="font-medium text-sm">
//                   Header {currentTemplate.headerFormat} URL *
//                 </label>
//                 <input
//                   className="w-full border rounded-xl p-3 mt-1"
//                   value={mediaUrl}
//                   onChange={(e) => setMediaUrl(e.target.value)}
//                   placeholder="https://..."
//                 />
//               </div>
//             )}
//             <div>
//               <label className="font-medium text-sm">Language: {currentTemplate.language}</label>
//             </div>
//           </div>

//           <div className="space-y-4">
//             {currentTemplate.variables.length > 0 ? (
//               currentTemplate.variables.map((v) => (
//                 <div key={v}>
//                   <label className="font-medium text-sm">
//                     Variable: {'{{'}
//                     {v}
//                     {'}}'} {v === 'name' ? '(Name Parameter)' : ''}
//                   </label>
//                   <textarea
//                     rows={2}
//                     className="w-full border rounded-xl p-3 mt-1"
//                     value={paramValues[v] || ''}
//                     onChange={(e) => setParamValues((prev) => ({ ...prev, [v]: e.target.value }))}
//                     placeholder={
//                       v === 'name'
//                         ? 'Tarun\nAmit\nRahul (one per line = bulk)'
//                         : `Enter value for ${v}`
//                     }
//                   />
//                   <p className="text- text-zinc-400 mt-1">
//                     Tip: Enter multiple lines same order as phones for bulk personalized
//                   </p>
//                 </div>
//               ))
//             ) : (
//               <p className="text-sm text-zinc-500">This template has no variables</p>
//             )}

//             <div>
//               <label className="font-medium text-sm">Phone Numbers</label>
//               <textarea
//                 rows={4}
//                 className="w-full border rounded-xl p-3 mt-1"
//                 value={phones}
//                 onChange={(e) => setPhones(e.target.value)}
//                 placeholder="7999267389&#10;9876543210"
//               />
//             </div>

//             <button
//               onClick={sendWhatsApp}
//               disabled={sending}
//               className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
//             >
//               {sending ? 'Sending...' : `Send ${currentTemplate.name}`}
//             </button>
//           </div>
//         </div>

//         {results.length > 0 && (
//           <div className="mt-6 border-t pt-4">
//             {results.map((r, i) => (
//               <div key={i} className="text-sm py-1 flex justify-between">
//                 <span>{r.phone}</span>
//                 <span>
//                   {r.status} {r.error}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

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
} from 'react-icons/fi';

type FetchedTemplate = {
  name: string;
  language: string;
  headerFormat: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | null;
  bodyText: string;
  variables: string[]; // ['name'] or ['1','2']
};

export default function Page() {
  const [templates, setTemplates] = useState<FetchedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState(''); // name|language
  const [phones, setPhones] = useState('');
  const [mediaUrl, setMediaUrl] = useState(
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLHNePLFGX8ZZ_bTYC5dBzK8OLp_IKipXZ8XMdsbem1A&s=10'
  );
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  // 1. Fetch from your new API
  useEffect(() => {
    fetch('/api/whatsapp/templates')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.templates.length) {
          setTemplates(d.templates);
          setSelectedKey(`${d.templates[0].name}|${d.templates[0].language}`);
          // init param values
          const init: Record<string, string> = {};
          d.templates[0].variables.forEach((v: string) => (init[v] = ''));
          if (d.templates[0].variables.includes('name')) init['name'] = 'Tarun';
          setParamValues(init);
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

  // When template changes, reset param inputs
  useEffect(() => {
    if (!currentTemplate) return;
    const init: Record<string, string> = {};
    currentTemplate.variables.forEach((v) => (init[v] = paramValues[v] || ''));
    // default for welcome_avdmc
    if (currentTemplate.variables.includes('name') && !init['name']) init['name'] = 'Tarun';
    setParamValues(init);
  }, [currentTemplate?.name, currentTemplate?.language]);

  const sendWhatsApp = async () => {
    const phoneList = phones
      .split(/[\n,]/)
      .map((p) => p.trim().replace(/\D/g, ''))
      .filter(Boolean)
      .map((p) => (p.length === 10 ? `91${p}` : p));

    if (!phoneList.length) return toast.warning('Enter phone numbers');
    if (currentTemplate?.headerFormat && !mediaUrl)
      return toast.warning(`Media URL required for ${currentTemplate.headerFormat}`);

    setSending(true);
    setResults([]);
    const toastId = toast.loading('Sending...');

    for (let i = 0; i < phoneList.length; i++) {
      const phone = phoneList[i];

      // Build params per phone - supports bulk (one value per line)
      const parameters = (currentTemplate?.variables || []).map((varName) => {
        const rawVal = paramValues[varName] || '';
        const lines = rawVal
          .split(/\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        const text = lines.length === phoneList.length ? lines[i] : lines[0] || rawVal || ' ';
        const isNamed = isNaN(Number(varName));
        if (isNamed) {
          return { type: 'text', parameter_name: varName, text };
        } else {
          return { type: 'text', text };
        }
      });

      try {
        const res = await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone,
            template: currentTemplate!.name,
            language: currentTemplate!.language,
            htype: currentTemplate!.headerFormat
              ? currentTemplate!.headerFormat.toLowerCase()
              : undefined,
            mediaUrl: currentTemplate!.headerFormat ? mediaUrl : undefined,
            parameters,
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
          <p className="text-slate-500 text-sm mt-1">
            We couldn&apos;t find any active or approved WhatsApp templates for your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              WhatsApp Business API
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Dynamic Broadcast Center
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {templates.length} templates synchronized from WABA ID:{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs text-slate-700 font-mono">
                {process.env.WHATSAPP_WABA_ID || '1062952783327668'}
              </code>
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 self-start sm:self-auto">
            <FiLayers className="text-slate-400 w-4 h-4" />
            <span className="text-xs font-medium text-slate-600">
              Active Template: <strong className="text-slate-900">{currentTemplate.name}</strong>
            </span>
          </div>
        </div>

        {/* Main Interface Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column: Config & Preview */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <label className="block font-semibold text-slate-700 text-sm mb-1.5 flex items-center gap-2">
                  <FiFileText className="text-slate-400" /> Select Template
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 pr-10 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                    value={selectedKey}
                    onChange={(e) => setSelectedKey(e.target.value)}
                  >
                    {templates.map((t) => (
                      <option key={`${t.name}|${t.language}`} value={`${t.name}|${t.language}`}>
                        {t.name} ({t.language.toUpperCase()}){' '}
                        {t.headerFormat ? `• ${t.headerFormat}` : ''}{' '}
                        {t.variables.length ? `• ${t.variables.length} vars` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Template Preview Box */}
              <div className="bg-gradient-to-br from-emerald-50/40 to-slate-50 border border-emerald-100/60 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  <span>Live Preview</span>
                  <span className="flex items-center gap-1 text-slate-500 font-normal normal-case">
                    <FiGlobe className="w-3 h-3" /> {currentTemplate.language.toUpperCase()}
                  </span>
                </div>
                <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed bg-white/80 p-3.5 rounded-lg border border-emerald-100/40 font-sans shadow-2xs">
                  {currentTemplate.bodyText || 'No body text specified for this template.'}
                </p>
              </div>

              {currentTemplate.headerFormat && (
                <div>
                  <label className="block font-semibold text-slate-700 text-sm mb-1.5 flex items-center gap-2">
                    <FiImage className="text-slate-400" /> Header {currentTemplate.headerFormat} URL{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://example.com/media.jpg"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Direct public URL pointing to the media asset.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
              <span>Header Type: {currentTemplate.headerFormat || 'None'}</span>
              <span>Variables: {currentTemplate.variables.length}</span>
            </div>
          </div>

          {/* Right Column: Dynamic Parameters & Dispatch */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              {currentTemplate.variables.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-slate-800 flex items-center justify-between">
                    <span>Template Parameters</span>
                    <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Dynamic Values
                    </span>
                  </div>
                  {currentTemplate.variables.map((v) => (
                    <div key={v} className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-700">
                        Variable{' '}
                        <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono">
                          &#123;&#123;{v}&#125;&#125;
                        </code>{' '}
                        {v === 'name' ? '(Recipient Name)' : ''}
                      </label>
                      <textarea
                        rows={2}
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                        value={paramValues[v] || ''}
                        onChange={(e) =>
                          setParamValues((prev) => ({ ...prev, [v]: e.target.value }))
                        }
                        placeholder={
                          v === 'name'
                            ? 'Tarun\nAmit\nRahul (one per line = bulk)'
                            : `Enter value for ${v}`
                        }
                      />
                      <p className="text-[11px] text-slate-400">
                        Tip: Provide values matching phone line order for personalized bulk
                        delivery.
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                  <p className="text-sm text-slate-500">
                    This template does not require any dynamic parameters.
                  </p>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 text-sm mb-1.5 flex items-center gap-2">
                  <FiPhone className="text-slate-400" /> Phone Numbers{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                  value={phones}
                  onChange={(e) => setPhones(e.target.value)}
                  placeholder="7999267389&#10;9876543210"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Separate numbers using commas or new lines.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={sendWhatsApp}
                disabled={sending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium rounded-xl py-3.5 px-4 shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        </div>

        {/* Results Drawer/Log */}
        {results.length > 0 && (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-800 text-base">Broadcast Summary Logs</h3>
              <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-full">
                Total Processed: {results.length}
              </span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {results.map((r, i) => {
                const isSuccess = r.status.includes('Sent');
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex items-center justify-between text-sm ${isSuccess ? 'bg-emerald-50/30 border-emerald-100 text-emerald-900' : 'bg-rose-50/30 border-rose-100 text-rose-900'}`}
                  >
                    <div className="flex items-center gap-2.5 font-mono">
                      {isSuccess ? (
                        <FiCheckCircle className="text-emerald-600 shrink-0" />
                      ) : (
                        <FiXCircle className="text-rose-600 shrink-0" />
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