---
layout: default
title: Daftar Isi
language: id
---
<section class="page toc-page"><p class="eyebrow">Volume I · Complete Draft</p><div class="toc-heading"><h1>Daftar Isi</h1><span>42 bagian</span></div><div class="language-tabs" aria-label="Pilih bahasa"><a class="active" aria-current="page" href="{{ '/read/' | relative_url }}">Bahasa Indonesia</a><a href="{{ '/read/en/' | relative_url }}">English</a></div><p><a class="button" href="{{ '/book/' | relative_url }}">Buka buku animasi</a></p><div class="toc-table-wrap"><table class="chapter-table"><thead><tr><th>Bab</th><th>Judul</th></tr></thead><tbody>{% for chapter in site.data.chapters %}<tr><td>{% if page.language == 'en' %}{{ chapter.label_en }}{% else %}{{ chapter.label_id }}{% endif %}</td><td><a href="{% if page.language == 'en' %}{{ '/read/en/' | append: chapter.slug | append: '/' | relative_url }}{% else %}{{ '/read/id/' | append: chapter.slug | append: '/' | relative_url }}{% endif %}">{% if page.language == 'en' %}{{ chapter.title_en }}{% else %}{{ chapter.title_id }}{% endif %}</a>{% if chapter.order >= 12 %}<small> · draf</small>{% endif %}</td></tr>{% endfor %}</tbody></table></div></section>

