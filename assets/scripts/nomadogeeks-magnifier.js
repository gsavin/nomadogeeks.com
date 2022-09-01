Vue.component("magnifier", {
    props: ["image"],
    inject: ["getLocation"],
    template: `
    <div class="magnifier">
        <figure class="image">
            <background-image :url="image.path" size="contain" />
        </figure>
        <div class="description">
          <h2 v-bind:title="image.description">{{ image.name }}</h2>
          <p><span v-if="image.location">{{ image.location }}, </span>{{ getLocation(image.country) }}, {{ image.date | formatDate }}</p>
        </div>
        <flag v-bind:location="image.country" class="is-hidden-touch"></flag>
    </div>
    `
});
