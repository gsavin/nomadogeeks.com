Vue.component("background-image", {
    data: function () {
        return {
            loaded: false,
            error: false
        };
    },
    props: {
        url: {
            required: true
        },
        position: {
            default: "center"
        },
        size: {
            default: "cover"
        }
    },
    mounted: function () {
        const image = new Image();
        image.onerror = (e) => {
            this.error = true;
        };
        image.onload = () => {
            this.loaded = true;
        };
        image.src = this.url;
    },
    computed: {
        style: function () {
            return {
                backgroundImage: `url(${this.url})`,
                backgroundPosition: this.position,
                backgroundSize: this.size
            };
        }
    },
    template: `
    <div class="background-image">
        <div v-if="loaded" class="has-ratio" :style="style"></div>
        <div v-else-if="error" class="error has-ratio"></div>
        <div v-else class="loading has-ratio"><div class="spinner"><div></div><div></div></div></div>
    </div>
    `
});
