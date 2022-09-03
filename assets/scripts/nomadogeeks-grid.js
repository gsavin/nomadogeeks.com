Vue.component("grid", {
    data () {
      return {
        page: (window.history.state || {}).page || 0
      }
    },
    props: ["elements", "elementsPerPage", "component"],
    created: function () {
      const url = new URL(window.location);
      
      if (url.searchParams.get("page")) {
        this.goTo(parseInt(url.searchParams.get("page")) - 1, false);
      }

      window.addEventListener("popstate", (e) => {
        if (window.history.state && window.history.state.page) {
          console.log("from state");
          this.goTo(window.history.state.page, true);
        } else {
          this.goTo(0, true);
        }
      });
    },
    computed: {
        displayed: function () {
          if (this.size === 0) {
            return [];
          }
    
          const p = Math.min(this.page, this.totalPages - 1);
          const start = Math.min(p * this.elementsPerPage, this.size - 1);
          const end = Math.min((p + 1) * this.elementsPerPage, this.size);
    
          return this.elements.slice(start, end);
        },
        size: function () {
            return this.elements.length;
        },
        totalPages: function () {
            return Math.ceil(this.size / this.elementsPerPage);
        }
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
          const url = new URL(window.location);
          url.searchParams.set('page', page + 1);
          window.history.pushState({page: this.page}, "Page " + this.page, url);
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
    template: "#grid-template"
  });
