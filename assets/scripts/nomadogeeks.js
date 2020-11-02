import { fetchData } from "./nomadogeeks-common.js";

const dateOptions = {
  year: "numeric",
  month: "long",
  day: "numeric"
};

function markdownFigure (md, config) {
  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    config = config || {}

    const token = tokens[idx]
    const srcIndex = token.attrIndex('src')
    const url = token.attrs[srcIndex][1]
    const caption = md.utils.escapeHtml(token.content)

    return '<figure class="image">' +
        '<img src="' + url + '" alt="' + caption + '" title="' + caption + '">' +
      '</figure>'
  }
}

const dateFormater = new Intl.DateTimeFormat("fr-FR", dateOptions);
/*const parser = new window.markdownit();
parser.use(markdownFigure);*/

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
// Routes
//

const Home = {
  template: "#home-template"
}

const PostsView = {
  computed: {
    posts: function () {
      const location = this.$route.params.location;
      let posts = this.$root.posts.data;

      if (location) {
        posts = posts.filter(post => post.location === location);
      }

      return posts;
    }
  },
  template: '<posts postsPerPage="10" v-bind:posts="posts" ref="posts" />'
}

const PostView = {
  computed: {
    postId: function () {
      const params = this.$route.params;
      return params.year + "-" + params.month + "-" + params.day + "-" + params.name;
    }
  },
  template: "<post v-bind:postId='postId' />"
}

const routes = [{
  path: "/",
  component: Home
}, {
  path: "/blog/:location?",
  component: PostsView
}, {
  path: "/:year(\\d+)/:month/:day/:name",
  component: PostView
}]

const router = new VueRouter({
  mode: "history",
  routes
})

router.afterEach(function (to, from,) {
  document.querySelector("#nomadogeeks > .scroll-anchor").scrollIntoView({
    block: "start",
    inline: "nearest",
    behavior: "smooth"
  });
})


//
// Main Vue
//

const nomadogeeks = new Vue({
  el: '#nomadogeeks',
  router,
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
    }
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
