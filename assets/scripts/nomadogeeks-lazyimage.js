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
})
