// /guide → /vpn/guide/ с сохранением якоря (#chrome и т. п.): старые ссылки из бота ведут на /guide.
location.replace('/vpn/guide/' + location.hash);
