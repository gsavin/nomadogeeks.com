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
      page: 0
    }
  },
  props: ["posts", "postsPerPage"],
  computed: {
    displayedPosts: function () {
      if (this.posts.length === 0) {
        return [];
      }

      const start = Math.min(this.page * this.postsPerPage, this.posts.length - 1);
      const end = Math.min((this.page + 1) * this.postsPerPage, this.posts.length);

      return this.posts.slice(start, end);
    },
    totalPages: function () {
      return Math.ceil(this.posts.length / this.postsPerPage);
    }
  },
  methods: {
    next () {
      this.page = Math.min(this.page + 1, this.totalPages - 1);
      this.scrollToTop();
    },
    previous () {
      this.page = Math.max(this.page - 1, 0);
      this.scrollToTop();
    },
    goTo (page) {
      this.page = page;
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
