'use client';

import { useState } from 'react';

interface CarouselCard {
  imageUrl: string;
  body: string;
  buttonText: string;
  buttonUrl: string;
  buttonParameter: string;
}

const createCard = (): CarouselCard => ({
  imageUrl: '',
  body: '',
  buttonText: 'View Offer',
  buttonUrl: '',
  buttonParameter: '',
});

const page = () => {
  const [templateName, setTemplateName] = useState('');
  const [language, setLanguage] = useState('en_US');
  const [category, setCategory] = useState('MARKETING');

  const [bodyText, setBodyText] = useState('');
  const [bodyParameter, setBodyParameter] = useState('');

  const [cards, setCards] = useState<CarouselCard[]>([createCard(), createCard()]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const updateCard = (index: number, field: keyof CarouselCard, value: string) => {
    setCards((current) =>
      current.map((card, cardIndex) =>
        cardIndex === index
          ? {
              ...card,
              [field]: value,
            }
          : card
      )
    );
  };

  const addCard = () => {
    if (cards.length >= 10) {
      setError('Maximum 10 cards are allowed.');
      return;
    }

    setCards((current) => [...current, createCard()]);
  };

  const removeCard = (index: number) => {
    if (cards.length <= 2) {
      setError('A carousel needs at least 2 cards.');
      return;
    }

    setCards((current) => current.filter((_, cardIndex) => cardIndex !== index));
  };

  const createTemplate = async () => {
    setMessage('');
    setError('');

    if (!templateName.trim()) {
      setError('Template name is required.');
      return;
    }

    if (!bodyText.trim()) {
      setError('Body text is required.');
      return;
    }

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      if (!card.imageUrl.trim()) {
        setError(`Image URL is required for Card ${i + 1}.`);
        return;
      }

      if (!card.body.trim()) {
        setError(`Body is required for Card ${i + 1}.`);
        return;
      }

      if (!card.buttonText.trim()) {
        setError(`Button text is required for Card ${i + 1}.`);
        return;
      }

      if (!card.buttonUrl.trim()) {
        setError(`Button URL is required for Card ${i + 1}.`);
        return;
      }
    }

    try {
      setLoading(true);

      const response = await fetch('/api/whatsapp/carousel/create-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateName: templateName.trim(),
          language,
          category,
          bodyText: bodyText.trim(),
          bodyParameter: bodyParameter.trim(),
          cards,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to create WhatsApp template.');
      }

      setMessage(data?.message || 'WhatsApp carousel template created successfully.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong while creating the template.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Create Carousel Template</h1>

          <p className="mt-1 text-sm text-slate-500">
            Create a WhatsApp carousel template with multiple interactive cards.
          </p>
        </div>

        {/* Success */}
        {message && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          {/* LEFT SIDE */}
          <div className="space-y-6">
            {/* Template Details */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-lg font-semibold text-slate-900">Template Details</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Configure the basic WhatsApp template information.
                </p>
              </div>

              <div className="grid gap-5 p-6 md:grid-cols-3">
                {/* Template Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Template Name
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) =>
                      setTemplateName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
                    }
                    placeholder="maldives_carousel"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Use lowercase letters, numbers and underscores.
                  </p>
                </div>

                {/* Language */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Language</label>

                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                  >
                    <option value="en_US">English (US)</option>
                    <option value="en_GB">English (UK)</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                  >
                    <option value="MARKETING">Marketing</option>
                    <option value="UTILITY">Utility</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Main Body */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-lg font-semibold text-slate-900">Carousel Body</h2>

                <p className="mt-1 text-sm text-slate-500">
                  This message appears above the carousel cards.
                </p>
              </div>

              <div className="p-6">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Body Text
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <textarea
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  rows={4}
                  placeholder="Exclusive offer! Get your Maldives holiday from USD {{1}} per person."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                />

                <div className="mt-4 max-w-sm">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Parameter {'{{1}}'}
                  </label>

                  <input
                    type="text"
                    value={bodyParameter}
                    onChange={(e) => setBodyParameter(e.target.value)}
                    placeholder="999"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Example: price, customer name, destination etc.
                  </p>
                </div>
              </div>
            </div>

            {/* Carousel Cards */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Carousel Cards</h2>

                  <p className="mt-1 text-sm text-slate-500">Add between 2 and 10 cards.</p>
                </div>

                <button
                  type="button"
                  onClick={addCard}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  + Add Card
                </button>
              </div>

              <div className="space-y-5 p-6">
                {cards.map((card, index) => (
                  <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50">
                    {/* Card Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                          {index + 1}
                        </div>

                        <div>
                          <h3 className="font-semibold text-slate-800">Card {index + 1}</h3>

                          <p className="text-xs text-slate-400">Image + body + URL button</p>
                        </div>
                      </div>

                      {cards.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeCard(index)}
                          className="rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="grid gap-5 p-5 md:grid-cols-2">
                      {/* Image URL */}
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Image URL
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <input
                          type="url"
                          value={card.imageUrl}
                          onChange={(e) => updateCard(index, 'imageUrl', e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                        />
                      </div>

                      {/* Image Preview */}
                      {card.imageUrl && (
                        <div className="md:col-span-2">
                          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <img
                              src={card.imageUrl}
                              alt={`Card ${index + 1}`}
                              className="h-48 w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Body */}
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Card Body
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <textarea
                          value={card.body}
                          onChange={(e) => updateCard(index, 'body', e.target.value)}
                          rows={3}
                          placeholder="Heritance Aarah - Premium All Inclusive experience."
                          className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                        />
                      </div>

                      {/* Button Text */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Button Text
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <input
                          type="text"
                          value={card.buttonText}
                          onChange={(e) => updateCard(index, 'buttonText', e.target.value)}
                          placeholder="View Offer"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                        />
                      </div>

                      {/* Button Parameter */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          URL Parameter
                        </label>

                        <input
                          type="text"
                          value={card.buttonParameter}
                          onChange={(e) => updateCard(index, 'buttonParameter', e.target.value)}
                          placeholder="offer123"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                        />
                      </div>

                      {/* Button URL */}
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Button URL
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <input
                          type="url"
                          value={card.buttonUrl}
                          onChange={(e) => updateCard(index, 'buttonUrl', e.target.value)}
                          placeholder="https://avdmc.com/{{1}}"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                        />

                        <p className="mt-1.5 text-xs text-slate-400">
                          Use {'{{1}}'} if the URL contains a dynamic parameter.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={createTemplate}
                disabled={loading}
                className="rounded-xl bg-green-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Creating Template...' : 'Create WhatsApp Template'}
              </button>
            </div>
          </div>

          {/* RIGHT SIDE PREVIEW */}
          <div>
            <div className="sticky top-6">
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-slate-900">WhatsApp Preview</h2>

                <p className="text-sm text-slate-500">Preview how the carousel will look.</p>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-300 bg-[#efeae2] shadow-sm">
                {/* Fake WhatsApp Header */}
                <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3 text-white">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                    A
                  </div>

                  <div>
                    <p className="text-sm font-semibold">WhatsApp</p>
                    <p className="text-[11px] text-white/70">Business</p>
                  </div>
                </div>

                {/* Chat */}
                <div className="min-h-[620px] p-4">
                  {/* Body */}
                  <div className="mb-3 max-w-[330px] rounded-2xl rounded-tl-md bg-white p-3 shadow-sm">
                    <p className="whitespace-pre-wrap text-sm leading-5 text-slate-800">
                      {bodyText
                        ? bodyText.replace('{{1}}', bodyParameter || '{{1}}')
                        : 'Your message body will appear here...'}
                    </p>
                  </div>

                  {/* Horizontal Carousel */}
                  <div className="flex gap-3 overflow-x-auto pb-4">
                    {cards.map((card, index) => (
                      <div
                        key={index}
                        className="w-[255px] min-w-[255px] overflow-hidden rounded-2xl bg-white shadow-sm"
                      >
                        {/* Image */}
                        {card.imageUrl ? (
                          <img
                            src={card.imageUrl}
                            alt={`Preview ${index + 1}`}
                            className="h-40 w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="flex h-40 items-center justify-center bg-slate-200 text-xs text-slate-400">
                            Card image
                          </div>
                        )}

                        {/* Card */}
                        <div className="p-3">
                          <p className="min-h-[58px] text-sm leading-5 text-slate-700">
                            {card.body || 'Card description...'}
                          </p>

                          <div className="mt-3 border-t border-slate-100 pt-3 text-center">
                            <span className="text-sm font-medium text-blue-600">
                              {card.buttonText || 'Button'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-right text-[10px] text-slate-400">9:41 AM</p>
                </div>
              </div>

              {/* Card Counter */}
              <div className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Carousel cards</span>

                  <span className="font-semibold text-slate-900">{cards.length} / 10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
