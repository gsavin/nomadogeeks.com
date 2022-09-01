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
        <div v-if="loaded" class="has-ratio image-content" :style="style"></div>
        <div v-else-if="error" class="error has-ratio"></div>
        <div v-else class="loading has-ratio"><div class="spinner"><div></div><div></div></div></div>
    </div>
    `
});

Vue.component("lazy-image", {
    data: function () {
        let observer = null;

        if (window["IntersectionObserver"]) {
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadImage();
                observer.unobserve(entry.target);
            }
            });
        }, {
            root: null,
            threshold: 0
        });
        }

        return {
        isLoaded: false,
        isError: false,
        src: "",
        observer: observer
        };
    },
    props: ["url"],
    mounted: function () {
        if (this.observer) {
        this.observer.observe(this.$refs.image);
        } else {
        this.loadImage();
        }
    },
    methods: {
        loadImage: function () {
        this.$refs.image.addEventListener("load", () => {
            this.isLoaded = true;
        });
        this.$refs.image.addEventListener("error", () => {
            this.isError = true;
        });
        this.src = this.url;
        }
    },
    template: '<figure class="image lazy" v-bind:class="{loaded: isLoaded, error: isError}"><img v-bind:src="src" ref="image" /><transition name="spinner"><div class="spinner" v-if="!isLoaded"></div></transition></figure>'
});
  