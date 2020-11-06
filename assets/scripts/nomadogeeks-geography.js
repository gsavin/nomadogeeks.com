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
