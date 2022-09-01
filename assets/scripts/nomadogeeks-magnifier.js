Vue.component("magnifier", {
    props: ["image", "hasNext", "hasPrevious"],
    inject: ["getLocation"],
    mounted: function () {
        this.$refs.self.focus();
    },
    template: `
    <div class="magnifier" tabindex="0" @keyup.esc="$emit('close')" @keyup.left="$emit('previous')" @keyup.right="$emit('next')" ref="self">
        <blurry-background :url="image.path" />
        <figure class="image">
            <background-image :url="image.path" size="contain" />
        </figure>
        <footer>
            <div class="description">
                <h2 v-bind:title="image.description">{{ image.name || image.location || " " }}</h2>
                <br />
                <p><span v-if="image.location && image.name">{{ image.location }}, </span>{{ getLocation(image.country) }}, {{ image.date | formatDate }}</p>
                <flag v-bind:location="image.country" class="is-hidden-touch"></flag>
            </div>
            <div class="control">
                <div v-if="hasPrevious" class="previous" @click="$emit('previous')"></div>
                <div v-else class="previous disabled"></div>
                <div v-if="hasNext" class="next" @click="$emit('next')"></div>
                <div v-else class="next disabled"></div>
                <div class="close" @click="$emit('close')"></div>
            </div>
        </footer>
    </div>
    `
});
