import { fetchData } from "./nomadogeeks-common.js";

Vue.component("image-preview", {
    props: ["path", "element", "index"],
    inject: ["getLocation"],
    template: "#image-preview-template"
});

Vue.component("collection-preview", {
  props: ["element"],
  template: "#collection-preview-template"
});

Vue.component("collections", {
  props: ["collections", "elementsPerPage"],
  template: `
  <grid class="collections" component="collection-preview" :elements="collections" :elementsPerPage="elementsPerPage" />
  `
});

Vue.component("collection", {
    data () {
      return {
        images: {
          error: null,
          loading: false,
          data: []
        },
        magnifyIndex: -1
      }
    },
    props: {
      id: {
        required: true
      },
      name: {
        default: ""
      },
      elementsPerPage: {
        default: 6
      }
    },
    mounted: function () {
      fetchData(this.images, `collections/${this.id}`, (data) => data)
        .then(() => {
          const url = new URL(window.location);
          
          if (url.searchParams.get("image")) {
            this.magnify(url.searchParams.get("image"), true);
          }
        });

      this.$root.$on("magnify", this.magnify);

      window.addEventListener("popstate", (e) => {
        if (window.history.state && window.history.state.image) {
          this.magnify(window.history.state.image, true);
        } else {
          this.magnifyIndex = -1;
        }
      });
    },
    methods: {
      magnify: function (image, noPush) {
        const index = this.images.data.findIndex((i) => i.id === image || i.path == image);

        if (index >= 0) {
          this.magnifyIndex = index;

          if (!noPush) {
            this.updateImageLink(this.images.data[index].id);
          }
        }
      },
      magnifierAction: function (action) {
        switch (action) {
          case "close":
            this.magnifyIndex = -1;
            const url = new URL(window.location);
            url.searchParams.delete("image");
            window.history.pushState({}, "", url);
            break;
          case "next":
            this.magnifyIndex = Math.min(this.images.data.length - 1, this.magnifyIndex + 1);
            this.updateImageLink(this.images.data[this.magnifyIndex].id);
            break;
          case "previous":
            this.magnifyIndex = Math.max(0, this.magnifyIndex - 1);
            this.updateImageLink(this.images.data[this.magnifyIndex].id);
            break;
        }
      },
      updateImageLink: function (image) {
        const url = new URL(window.location);
        url.searchParams.set('image', image);

        if (window.history.state && window.history.state.image) {
          window.history.replaceState({image: image}, "Image " + this.page, url);
        } else {
          window.history.pushState({image: image}, "Image " + this.page, url);
        }
      }
    },
    template: `
    <div>
      <grid class="collection" component="image-preview" :elements="images.data" :elementsPerPage="elementsPerPage" @magnify="magnify" />
      <magnifier v-if="magnifyIndex >= 0" :image="images.data[magnifyIndex]" :hasNext="magnifyIndex < images.data.length - 1" :hasPrevious="magnifyIndex > 0"
        @next="magnifierAction('next')"
        @previous="magnifierAction('previous')"
        @close="magnifierAction('close')" />
    </div>
    `
  });
