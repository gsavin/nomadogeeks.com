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
  props: ["posts", "postsPerPage"],
  template: "#posts-template"
})
