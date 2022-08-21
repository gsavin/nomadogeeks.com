import { fetchData } from "./nomadogeeks-common.js";

Vue.component("image-preview", {
    props: ["path", "element"],
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
        }
      }
    },
    props: ["id", "name"],
    mounted: function () {
      fetchData(this.images, `collections/${this.id}`, (data) => data);
    },
    template: "#collection-template"
  });
