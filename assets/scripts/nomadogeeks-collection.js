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
    props: ["id", "name"],
    mounted: function () {
      fetchData(this.images, `collections/${this.id}`, (data) => data);

      const url = new URL(window.location);
      
      if (url.searchParams.get("image")) {
        this.magnify(url.searchParams.get("image"), true);
      }
    },
    methods: {
      magnify: function (image, noPush) {
        const index = this.images.data.findIndex((i) => i.digest === image);

        if (index >= 0) {
          this.magnifyIndex = index;

          if (!noPush) {
            this.updateImageLink(image);
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
            this.updateImageLink(this.images.data[this.magnifyIndex].digest);
            break;
          case "previous":
            this.magnifyIndex = Math.max(0, this.magnifyIndex - 1);
            this.updateImageLink(this.images.data[this.magnifyIndex].digest);
            break;
        }
      },
      updateImageLink: function (image) {
        const url = new URL(window.location);
        url.searchParams.set('image', image);
        window.history.pushState({image: image}, "Image " + this.page, url);
      }
    },
    template: `
    <div>
      <grid class="collection" component="image-preview" :elements="images.data" elementsPerPage="6" @magnify="magnify" />
      <magnifier v-if="magnifyIndex >= 0" :image="images.data[magnifyIndex]" :hasNext="magnifyIndex < images.data.length - 1" :hasPrevious="magnifyIndex > 0"
        @next="magnifierAction('next')"
        @previous="magnifierAction('previous')"
        @close="magnifierAction('close')" />
    </div>
    `
  });
