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
  data () {
    return {
      collections: {
        error: null,
        loading: false,
        data: []
      }
    }
  },
  mounted: function () {
    fetchData(this.collections, "collections");
  },
  template: `
  <grid class="collections" component="collection-preview" :elements="collections.data" elementsPerPage="12" />
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
    },
    methods: {
      magnify: function (image) {
        const index = this.images.data.findIndex((i) => i.id === image);

        if (index >= 0) {
          this.magnifyIndex = index;
        }
      }
    },
    template: "#collection-template"
  });
