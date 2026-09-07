# Salon Besy – pokyny pro AI

Nejdřív si přečti `BRIEF.md` v kořeni projektu. Obsahuje popis projektu, design tokeny, strukturu stránky, stavební prvky, konvence a seznam placeholderů.

Klíčová pravidla:
- Čisté HTML + CSS + JS bez buildu. Nepřidávat frameworky ani závislosti – jediná výjimka je Leaflet v `js/vendor/` a `css/vendor/`, který vykresluje mapu v kontaktech (schváleno uživatelem, důvod v BRIEF.md, sekce 9). Neodstraňovat ho.
- Držet vizuální styl: blob ořezy fotek, vlny mezi sekcemi, doodly, paleta a fonty z `:root` v `css/styles.css`.
- České texty s českou typografií (`&nbsp;` po jednopísmenných předložkách, uvozovky „ “).
- Po každé úpravě zkontrolovat stránku v prohlížeči na desktopu i mobilu (postup v BRIEF.md, sekce 10).
