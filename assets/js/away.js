// Заглушки старых адресов (/vpn/, /vpn/guide/, /guide.html, /privacy.html и EN): уводят на новый адрес из <html data-to>
// (только https://) вместе с #якорем — /vpn/guide/#iphone → …/guide/#iphone. Без JS — meta refresh в <noscript> (якорь теряется).
const to = document.documentElement.getAttribute('data-to') || '';
if (/^https:\/\/[^\s"'<>#]+$/.test(to)) location.replace(to + location.hash);
