#!/bin/bash

country=$1
post=$2

collection=$(echo $post | tr / -)

for f in $(find assets/images/${post} -type f | sort); do
	id=${f##assets/images};
	id=${id%%.jpg};
	if [ $(basename ${id}) = "preview" -o $(basename ${id}) = "preview-full" ]; then continue; fi
	imgdate=$(exiv2 -K Exif.Photo.DateTimeOriginal -K Exif.Image.DateTimeOriginal -P v ${f} | head -n1 | awk '{gsub(/:/, "/", $1)} 1')
	latitude=$(exiv2 -P v -K Xmp.drone-dji.Latitude ${f})
	longitude=$(exiv2 -P v -K Xmp.drone-dji.Longitude ${f})

	cat <<EOF
- id: ${id}
  path: /$f
  name:
  date: ${imgdate}
  description:
  location:
  country: $country
  tags:
    - $country
EOF
	if [ -n "$latitude" ]; then
		echo "  latitude: ${latitude##+}"
		echo "  longitude: ${longitude##+}"
	fi
done > _data/images/${collection}.yml
