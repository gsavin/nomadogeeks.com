import { fetchData } from "./nomadogeeks-common.js";

Vue.component("image-preview", {
    props: ["path", "element", "index"],
    inject: ["getLocation"],
    template: `
    <div class="post-preview">
      <transition name="post-preview-animator" mode="out-in"><div class="animator" v-bind:key="element.id"></div></transition>
      <article class="container">
        <a @click="$parent.$emit('magnify', element.id)">
          <div class="thumbnail">
            <figure class="image is-2by1">
              <background-image :url="element.path" />
            </figure>
            <div class="description">
              <h2 v-bind:title="element.description">{{ element.name || element.location || " " }}</h2>
              <br />
              <p><span v-if="element.location && element.name" class="is-hidden-touch">{{ element.location }}, </span>{{ getLocation(element.country) }}, {{ element.date | formatDate }}</p>
            </div>
            <flag v-bind:location="element.country" class="is-hidden-touch"></flag>
          </div>
        </a>
      </article>
    </div>
    `
});

Vue.component("collection-preview", {
  props: ["element"],
  template: `
  <div class="post-preview">
    <transition name="post-preview-animator" mode="out-in"><div class="animator" v-bind:key="element.id"></div></transition>
    <article class="container">
      <a v-bind:href="element.url">
        <div class="thumbnail">
          <figure class="image is-2by1"><background-image v-bind:url="element.image" /></figure>
          <div class="description">
            <h2 v-bind:title="element.title">{{ element.title }}</h2>
          </div>
        </div>
      </a>
    </article>
  </div>
  `
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
        content: {
          error: null,
          loading: false,
          data: {}
        },
        magnifyIndex: -1
      }
    },
    computed: {
      images: function() {
        return this.content.data.images || [];
      },
      collections: function() {
        return this.content.data.collections || [];
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
      fetchData(this.content, `collections/${this.id}`, (data) => data)
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
        const index = this.images.findIndex((i) => i.id === image || i.path == image);

        if (index >= 0) {
          this.magnifyIndex = index;

          if (!noPush) {
            this.updateImageLink(this.images[index].id);
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
            this.magnifyIndex = Math.min(this.images.length - 1, this.magnifyIndex + 1);
            this.updateImageLink(this.images[this.magnifyIndex].id);
            break;
          case "previous":
            this.magnifyIndex = Math.max(0, this.magnifyIndex - 1);
            this.updateImageLink(this.images[this.magnifyIndex].id);
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
      <collections v-if="collections.length > 0" :collections="this.collections" elements-per-page="12" />
      <grid class="collection" component="image-preview" :elements="images" :elementsPerPage="elementsPerPage" @magnify="magnify" />
      <magnifier v-if="magnifyIndex >= 0" :image="images[magnifyIndex]" :hasNext="magnifyIndex < images.length - 1" :hasPrevious="magnifyIndex > 0"
        @next="magnifierAction('next')"
        @previous="magnifierAction('previous')"
        @close="magnifierAction('close')" />
    </div>
    `
  });
