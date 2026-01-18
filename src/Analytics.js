// analytics.js utility file
export const trackPage = (url) => {
  window.gtag('config', 'G-SQGDJM538K', {
    page_path: url,
  });
};
