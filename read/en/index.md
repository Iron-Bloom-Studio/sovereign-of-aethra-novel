---
layout: default
title: Table of Contents
language: en
---
<section class="page toc-page"><p class="eyebrow">Volume I · Complete Draft</p><div class="toc-heading"><h1>Table of Contents</h1><span>42 parts</span></div><div class="language-tabs" aria-label="Choose language"><a href="{{ '/read/' | relative_url }}">Bahasa Indonesia</a><a class="active" aria-current="page" href="{{ '/read/en/' | relative_url }}">English</a></div><p><a class="button" href="{{ '/book/en/' | relative_url }}">Open animated book</a></p><div class="toc-table-wrap"><table class="chapter-table"><thead><tr><th>Chapter</th><th>Title</th></tr></thead><tbody>{% for chapter in site.data.chapters %}<tr><td>{% if page.language == 'en' %}{{ chapter.label_en }}{% else %}{{ chapter.label_id }}{% endif %}</td><td><a href="{% if page.language == 'en' %}{{ '/read/en/' | append: chapter.slug | append: '/' | relative_url }}{% else %}{{ '/read/id/' | append: chapter.slug | append: '/' | relative_url }}{% endif %}">{% if page.language == 'en' %}{{ chapter.title_en }}{% else %}{{ chapter.title_id }}{% endif %}</a>{% if chapter.order >= 12 %}<small> · draft</small>{% endif %}</td></tr>{% endfor %}</tbody></table></div></section>

