---
title: Photos
layout: default
permalink: /photos/
---
<div id="nomadogeeks">
  {% include nav.html %}
  <collections v-bind:collections="collections.data" elements-per-page="12" />
  {% include footer.html %}
</div>

{% include vuejs/collection-preview.template.html %}
{% include vuejs/grid.template.html %}
{% include vuejs/pagination.template.html %}