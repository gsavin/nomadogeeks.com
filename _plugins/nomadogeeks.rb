require 'digest/sha1'

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

  class CollectionPageGenerator < Generator
    safe true

    def generate(site)
      site.data["collections"].each_entry do |collection|
        collection["hidden"] = false
      end
      images_per_tag = Hash.new
      site.data["images"].each_key do |imageskey|
        imageset = site.data["images"][imageskey]
        images_per_tag[imageskey] = []
        imageset.each_entry do |image|
          image["digest"] = Digest::SHA1.hexdigest image["id"]
          image["tags"].each_entry do |tag|
            images_per_tag[tag] = images_per_tag.fetch(tag, []).append(image)
          end
          images_per_tag[imageskey].append(image)
        end
        post_path = imageskey.sub("-", "/").sub("-", "/").sub("-", "/")
        site.data["collections"] << {
          "id" => imageskey,
          "tag" => imageskey,
          "name" => imageskey,
          "description" => "",
          "preview" => "/assets/images/" + post_path + "/preview.jpg",
          "hidden" => true
        }
      end
      site.data["locations"].each_key do |location|
        images = images_per_tag.fetch(location, [])
        next if images.length() == 0
        site.data["collections"] << {
          "id" => location,
          "tag" => location,
          "name" => site.data["locations"][location]["name"],
          "description" => "",
          "preview" => "/assets/images/flags/" + location + ".svg",
          "hidden" => true,
          "parent" => "destinations"
        }
      end
      site.data["collections"].each_entry do |collection|
        images = images_per_tag.fetch(collection["tag"], [])
        site.pages << CollectionData.new(site, site.source, File.join("assets", "data", "collections"), collection, images)
        site.pages << CollectionPage.new(site, site.source, File.join("photos", "collections", collection["id"]), collection)
      end
    end
  end

  class CollectionData < Page
    def initialize(site, base, dir, collection, images)
      @site = site
      @base = base
      @dir = dir
      @name = collection["id"] + ".json"

      self.process(@name)
      self.read_yaml(File.join(base, "_layouts"), "collection.json")
      self.data["id"] = collection["id"]
      self.data["images"] = images
    end
  end

  class CollectionPage < Page
    def initialize(site, base, dir, collection)
      @site = site
      @base = base
      @dir = dir
      @name = "index.html"

      self.process(@name)
      self.read_yaml(File.join(base, "_layouts"), "collection.html")
      self.data["id"] = collection["id"]
      self.data["name"] = collection["name"]
      self.data["description"] = collection["description"]
      self.data["title"] = "Collection / " + collection["name"]
      self.data["preview"] = collection["preview"]
    end
  end
end
