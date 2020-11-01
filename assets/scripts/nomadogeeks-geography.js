import { debounce, fetchData } from "./nomadogeeks-common.js";

Vue.component("geographies", {
  data: function () {
    return {
      width: window.innerWidth,
      geojson: {
        error: null,
        loading: false,
        data: {
          features: []
        }
      }
    }
  },
  computed: {
    geographies: function () {
      const w = Math.min(this.width, 960) - 24;
      const h = 0.618 * w;
      const p = d3.geoMercator()
        .fitSize([w, h], this.geojson.data)
        .rotate([-11, 0]);

      const projection = d3.geoPath(p);

      return this.geojson.data.features.map(feature => {
        return {
          key: feature.properties.id,
          name: feature.properties.name,
          path: projection(feature)
        }
      });
    }
  },
  created: function () {
    fetchData(this.geojson, "geojson", prepareGeoData);
  },
  mounted: function () {
    window.addEventListener("resize", debounce(() => {this.width = window.innerWidth}, 250));
  },
  template: "#geographies-template"
})

Vue.component("geography", {
  props: ["geography"],
  inject: ["hasLocation", "isLocationBefore"],
  computed: {
    isBefore: function () {
      return this.isLocationBefore(this.geography.key)
    },
    isVisited: function () {
      return this.hasLocation(this.geography.key);
    }
  },
  methods: {
    goTo: function () {
      if (this.isVisited) {
        window.location = "/blog/" + this.geography.key;
      }
    }
  },
  template: "#geography-template"
})

Vue.component("geoavatar", {
  props: ["location"],
  computed: {
    path: function () {
      const f = this.getCountryFeature(this.location);
      const p = d3.geoMercator()
        .fitExtent([[5, 5], [55, 55]], f)
        .rotate([-11, 0]);

      return d3.geoPath(p)(f.features[0]);
    }
  },
  methods: {
    getCountryFeature: function(location) {
      return {
        type: "FeatureCollection",
        features: this.geojson.data.features.filter(feature => feature.properties.id === location)
      };
    }
  },
  template: '<div class="avatar"><svg class="geo" width="60" height="60"><path v-bind:d="path" /></svg>'
})

function prepareGeoData(data) {
  const geojson = topojson.feature(data, data.objects[Object.keys(data.objects)[0]]);
  geojson.features = geojson.features
    .map(feature => ({
      geometry: feature.geometry,
      type: feature.type,
      properties: {
        id: feature.properties.NAME.toLowerCase().replace(/\W+/g, "-"),
        name: feature.properties.NAME
      }
    }))
    .filter(feature => feature.properties.id !== 'antarctica');

  return geojson;
}
