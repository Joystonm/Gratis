---
name: cloudinary-transformations
description: Reference for all Cloudinary delivery URL transformation parameters used in Gratis. Use when building or modifying cloudinaryService.ts, adding new AI effects, or debugging transformation URLs.
---

# Cloudinary Transformation Reference

## URL Structure

```
https://res.cloudinary.com/<cloud_name>/image/upload/<transformations>/<public_id>
```

## AI Effects

| Effect | URL Parameter |
|---|---|
| Background removal | `e_background_removal` |
| AI enhancement | `e_enhance` |
| Upscaling | `e_upscale` |
| Generative fill | `e_gen_fill` |

## Art Filters (21 total)

`e_art:<style>` — available styles:

`al_dente`, `athena`, `audrey`, `aurora`, `daguerre`, `eucalyptus`, `fes`, `frost`, `hairspray`, `hokusai`, `incognito`, `linen`, `peacock`, `primavera`, `quartz`, `red_rock`, `refresh`, `sizzle`, `sonnet`, `ukulele`, `zorro`

## Color Adjustments

| Adjustment | Parameter |
|---|---|
| Vibrance | `e_vibrance:<-100..100>` |
| Fill light | `e_fill_light:<0..100>` |
| Vignette | `e_vignette:<0..100>` |
| Tint | `e_tint:<0..100>` |

## Format Conversion and Optimization

| Option | Parameter |
|---|---|
| Format | `f_webp`, `f_avif`, `f_png`, `f_jpg` |
| Quality | `q_auto`, `q_<1-100>` |
| Responsive width | `w_auto,c_scale` |

## Chaining Transformations

Multiple transformations are separated by `/`:

```
e_background_removal/e_enhance/f_webp/q_auto
```

## Upload Preset Rules

- Always unsigned: `upload_preset=<preset_name>`
- Never use `api_secret` in frontend code
- Compress to ≤ 4000×4000 before upload (Cloudinary's 25MP limit)
