import { fetchData } from "./nomadogeeks-common.js";

const dateOptions = {
  year: "numeric",
  month: "long",
  day: "numeric"
};

const dateFormater = new Intl.DateTimeFormat("fr-FR", dateOptions);

Vue.filter('formatDate', function(value) {
  if (value) {
    const d = new Date(value);
    return dateFormater.format(d);
  }
})

//
// Components
//

Vue.component('avatar', {
  props: ["avatar"],
  template: '<div class="avatar"><img v-bind:src="avatar.src" v-bind:srcset="avatar.srcset" width="60" height="60" /></div>'
})

Vue.component('flag-avatar', {
  props: ["location"],
  computed: {
    background: function () {
      return `background-image: url(/assets/images/flags/${this.location}.svg`;
    }
  },
  template: '<div class="avatar flag"><div v-bind:style="background"></div></div>'
})

Vue.component('pagination', {
  props: ["page", "total"],
  template: "#pagination-template"
})

Vue.component('post-preview', {
  props: ["post"],
  inject: ["getAuthorAvatar", "getLocation", "getLocationFlag"],
  template: '#post-preview-template',
  computed: {
    image: function () {
      return `/assets/images/${this.post.id}/preview.jpg`;
    }
  }
})

Vue.component("post", {
  data: function () {
    return {
      loading: false,
      error: null,
      post: {
        date: null,
        title: "",
        id: null,
        author: "",
        categories: [],
        location: "",
        content: []
      }
    };
  },
  computed: {
    image: function () {
      if (!this.post.id) {
        return "";

      }
      return `background-image: url(/assets/images/${this.post.id}/preview-full.jpg)`;
    }
  },
  props: ["postId"],
  inject: ["getAuthorAvatar", "getLocation"],
  created: function () {
    this.loading = true;

    fetch(`/data/posts/${this.postId}/content.json`).then(response => {
      this.loading = false;

      if (!response.ok) {
        this.error = "Unable to retrieve post content"
        console.error("Failed to load post content", response.status);
      } else {
        return response.json().then(data => {
          this.error = null;
          this.post = data;
        });
      }
    })
  },
  template: "#post-template"
})

Vue.component("markdown-renderer", {
  props: ["content"],
  computed: {
    rawHTML: function () {
      return parser.render(this.content);
    }
  },
  template: '<div v-html="rawHTML"></div>'
})

Vue.component("yt-video", {
  props: ["videoId"],
  computed: {
    src: function () {
      return `https://www.youtube.com/embed/${this.videoId}`;
    }
  },
  template: '<iframe width="640" height="385" v-bind:src="src" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
})

//
// Main Vue
//

const nomadogeeks = new Vue({
  el: '#nomadogeeks',
  data: {
    authors: {
      error: null,
      loading: false,
      data: {}
    },
    locations: {
      error: null,
      loading: false,
      data: {}
    },
    posts: {
      error: null,
      loading: false,
      data: []
    },
    menuOpened: false
  },
  computed: {
    locationsList: function () {
      return Object.entries(this.locations.data)
        .map(([id, location]) => ({
          id: id,
          ...location
        }))
        .filter(location => !location.before)
        .sort((a, b) => a.name.localeCompare(b.name));
    }
  },
  created: function () {
    fetchData(this.posts, "posts");
    fetchData(this.locations, "locations");
    /*fetchData(this.authors, "authors");
    fetchData(this.geojson, "geojson", prepareGeoData)*/
  },
  methods: {
    burgerToggled: function () {
      this.menuOpened = !this.menuOpened;
    }
  },
  provide: function () {
    return {
      getAuthor(id) {
        const author = this.$root.authors.data[id];
        return (author && author.displayName) || id;
      },
      getAuthorAvatar(id) {
        const author = this.$root.authors.data[id];
        return (author && author.avatar) || id;
      },
      getLocation(id) {
        const location = this.$root.locations.data[id];
        return (location && location.name) || id;
      },
      hasLocation(id) {
        return (this.$root.locations.data[id] && true) || false;
      },
      isLocationBefore(id) {
        const location = this.$root.locations.data[id];
        return (location && location.before) || false;
      },
      getLocationFlag(id) {
        return {
          src: `/images/flags/${id}.svg`
        };
      }
    }
  }
})
