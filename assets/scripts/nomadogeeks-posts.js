Vue.component("filtered-posts", {
  data () {
    return {
      page: 0
    }
  },
  props: ["posts", "postsPerPage", "filter"],
  computed: {
    filteredPosts: function () {
      return this.posts.filter(post => this.filter === "" || post.tags.includes(this.filter));
    }
  },
  template: '<posts v-bind:posts-per-page="postsPerPage" v-bind:posts="filteredPosts" />'
});

Vue.component('posts', {
  data () {
    return {
      page: (window.history.state || {}).page || 0
    }
  },
  props: ["posts", "postsPerPage"],
  computed: {
    displayedPosts: function () {
      if (this.posts.length === 0) {
        return [];
      }

      const p = Math.min(this.page, this.totalPages - 1);
      const start = Math.min(p * this.postsPerPage, this.posts.length - 1);
      const end = Math.min((p + 1) * this.postsPerPage, this.posts.length);

      return this.posts.slice(start, end);
    },
    totalPages: function () {
      return Math.ceil(this.posts.length / this.postsPerPage);
    }
  },
  created: function () {
    window.addEventListener("popstate", (e) => {
      if (window.history.state && window.history.state.page) {
        this.goTo(window.history.state.page, true);
      } else {
        this.goTo(0, true);
      }
    });
  },
  methods: {
    next () {
      this.goTo(Math.min(this.page + 1, this.totalPages - 1));
    },
    previous () {
      this.goTo(Math.max(this.page - 1, 0));
    },
    goTo (page, noPush) {
      this.page = page;
      if (!noPush) {
        window.history.pushState({page: this.page}, "Page " + this.page);
      }
      this.scrollToTop();
    },
    scrollToTop () {
      this.$nextTick(() => {
        this.$refs.container.scrollIntoView({
          block: "start",
          inline: "nearest",
          behavior: "smooth"
        });
      });
    }
  },
  template: "#posts-template"
})
