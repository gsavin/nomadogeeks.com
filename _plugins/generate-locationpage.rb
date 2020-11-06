module Jekyll
  class LocationPageGenerator < Generator
    safe true

    def generate(site)
      dir = "blog"
      site.data["locations"].each_key do |location|
        site.pages << LocationPage.new(site, site.source, File.join(dir, location), location)
      end
    end
  end

  class LocationPage < Page
    def initialize(site, base, dir, location)
      @site = site
      @base = base
      @dir = dir
      @name = "index.html"

      self.process(@name)
      self.read_yaml(File.join(base, "_layouts"), "posts.html")
      self.data["filter"] = location
      self.data["title"] = site.data["locations"][location]["name"]
    end
  end
end
