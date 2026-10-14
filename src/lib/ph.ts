// Wraps [bracketed placeholders] (and a leading $) in a highlighted span so unfinished content is easy to spot.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const ph = (text: string) =>
  esc(text).replace(/\$?\[[^\]]+\]/g, (m) => `<span class="ph">${m}</span>`);
