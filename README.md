# Harmonograf — Levha VII

İki dik sarkaç salınımının izini çizen dijital harmonograf: Lissajous eğrileri (sönümsüz) ve
merkeze kapanan harmonograf desenleri (sönümlü). "Etkileşimli Bilim Levhaları" serisinin
yedinci levhası — kâğıt/mürekkep temasıyla, saf JavaScript.

**Canlı:** https://hakanatas.github.io/harmonograf/ · **Ana sayfa:** https://hakanatas.github.io/bilim-levhalari/

## Özellikler
- Frekans X/Y, faz farkı, sönüm ve hız kaydırıcıları; renkli iz (çini→mor→pas gradyanı).
- Sönüm 0: sonsuz dönen kapalı Lissajous eğrisi. Sönüm > 0: merkeze kapanan spiral harmonograf.
- Hazır ayarlar: Daire (1:1), Beşli (3:2), Üçlü (5:4), Klasik harmonograf, Gül. Canlı oran okuması.
- Dokunmatik ve mobil uyumlu.

## Matematik
x(t) = sin(fx·t + φ)·e^(−δt), y(t) = sin(fy·t)·e^(−δt). Frekans oranı rasyonelse eğri kapanır.

```bash
python3 -m http.server 8324
```
