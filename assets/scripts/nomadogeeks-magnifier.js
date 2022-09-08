Vue.component("magnifier", {
    data: function () {
        return {
            swiping: false,
            swipeStartX: 0,
            swipeStartY: 0
        };
    },
    props: ["image", "hasNext", "hasPrevious"],
    inject: ["getLocation"],
    mounted: function () {
        this.$refs.self.focus();
    },
    methods: {
        touchStart: function (e) {
            this.swiping = true;
            this.swipeStartX = e.changedTouches[0].screenX;
            this.swipeStartY = e.changedTouches[0].screenY;
        },
        touchEnd: function (e) {
            if (this.swiping) {
                this.swiping = false;
                const swipeEndX = e.changedTouches[0].screenX;
                const swipeEndY = e.changedTouches[0].screenY;

                if (Math.abs(swipeEndX - this.swipeStartX) > 50) {
                    if (swipeEndX < this.swipeStartX) {
                        this.$emit("next");
                    } else {
                        this.$emit("previous");
                    }
                } else if (Math.abs(swipeEndY - this.swipeStartY) > 50) {
                    this.$emit("close");
                }
            }
        }
    },
    template: `
    <div class="magnifier" tabindex="0" @keyup.esc="$emit('close')" @keyup.left="$emit('previous')" @keyup.right="$emit('next')" ref="self">
        <blurry-background :url="image.path" />
        <figure class="image" @touchstart="touchStart" @touchend="touchEnd">
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
                <div v-if="hasPrevious" class="is-hidden-touch previous" @click="$emit('previous')"></div>
                <div v-else class="is-hidden-touch previous disabled"></div>
                <div v-if="hasNext" class="is-hidden-touch next" @click="$emit('next')"></div>
                <div v-else class="is-hidden-touch next disabled"></div>
                <div class="close" @click="$emit('close')"></div>
            </div>
        </footer>
    </div>
    `
});
