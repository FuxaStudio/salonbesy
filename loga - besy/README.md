# Logo, sada souborů

Zdrojová bitmapa byla převedena na vektor, takže všechno níž je ostré v jakékoli velikosti.
Olivová je vzorkovaná z tvého podkladu: `#6F844C`.

## Navbar

| Soubor | Popis |
|---|---|
| `logo-black.svg` | černé linky, průhledné pozadí |
| `logo-white.svg` | bílé linky, průhledné pozadí |
| `logo.svg` | `fill="currentColor"`, barvu řídí CSS (jen pro inline SVG) |
| `logo-black.png`, `@2x`, `@3x` | 280 / 560 / 840 px, průhledné |
| `logo-white.png`, `@2x`, `@3x` | 280 / 560 / 840 px, průhledné |

Do navbaru ber SVG, PNG je jen fallback.

```html
<img src="/img/logo-black.svg" alt="Logo" width="44" height="45">
```

Pozor: `logo.svg` s `currentColor` funguje jen když SVG vložíš přímo do HTML.
V `<img>` se `currentColor` vyhodnotí jako černá, tam použij `logo-black.svg` / `logo-white.svg`.

Přepínání podle světlého/tmavého režimu:

```html
<picture>
  <source srcset="/img/logo-white.svg" media="(prefers-color-scheme: dark)">
  <img src="/img/logo-black.svg" alt="Logo" width="44" height="45">
</picture>
```

## Favicon

| Soubor | K čemu |
|---|---|
| `favicon.svg` | hlavní, olivový zaoblený čtverec + bílé linky |
| `favicon.ico` | fallback pro starší prohlížeče (16/32/48 v jednom) |
| `favicon-16.png`, `-32.png`, `-48.png` | jednotlivé velikosti |
| `apple-touch-icon.png` | 180×180, bez zaoblení, iOS si roh ořízne sám |
| `icon-192.png`, `icon-512.png` | PWA manifest |
| `favicon-simple-*.png`, `favicon-simple.ico` | volitelná zjednodušená silueta pro 16 px |

Do `<head>`:

```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

Pořadí je záměrné. Prohlížeč, který umí SVG, si vezme `favicon.svg`, ostatní spadnou na `.ico`.
