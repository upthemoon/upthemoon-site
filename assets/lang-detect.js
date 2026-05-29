/**
 * Up the Moon — Browser locale auto-redirect (client-side)
 * 2026-05-29 主任シエル実装
 *
 * 動作:
 * - 初回訪問時のみ browser locale 検出 → ja 以外なら /en/ に redirect
 * - LocalStorage に「ユーザー手動選択」を覚えたら以降は自動 redirect しない
 * - 言語切替ボタン (setLanguage('ja' | 'en')) は手動選択を記録
 *
 * GitHub Pages は静的ホスティングのため client-side で redirect する設計
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'upthemoon_lang';
  var path = window.location.pathname;
  var isEn = path.indexOf('/en/') === 0 || path === '/en';
  var isJa = !isEn;

  // ユーザーが手動選択した言語を最優先 (auto-redirect スキップ)
  var userLang = null;
  try { userLang = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  if (userLang) {
    // 手動選択あり → 現在 path と不一致なら 1 回だけ正しい言語に redirect
    if (userLang === 'en' && isJa) {
      window.location.replace('/en' + (path === '/' ? '/' : path));
    } else if (userLang === 'ja' && isEn) {
      window.location.replace(path.replace(/^\/en/, '') || '/');
    }
    return;
  }

  // 初回訪問: browser locale 検出
  var browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
  var wantsJa = browserLang.indexOf('ja') === 0;

  if (!wantsJa && isJa) {
    // 非日本語ブラウザ・日本語 path → 英語版に redirect
    window.location.replace('/en' + (path === '/' ? '/' : path));
  }
  // 日本語ブラウザは何もしない (デフォルト日本語のまま)
  // 英語ブラウザで /en/ にいる場合も何もしない (既に正しい言語)
})();

// 手動切替ボタン用 (グローバル関数)
function setLanguage(lang) {
  try { localStorage.setItem('upthemoon_lang', lang); } catch (e) {}
  var path = window.location.pathname;
  var isEn = path.indexOf('/en/') === 0 || path === '/en';
  if (lang === 'en' && !isEn) {
    window.location.href = '/en' + (path === '/' ? '/' : path);
  } else if (lang === 'ja' && isEn) {
    window.location.href = path.replace(/^\/en/, '') || '/';
  }
}
