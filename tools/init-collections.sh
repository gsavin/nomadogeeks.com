#!/bin/bash

country=$1
post=$2

collection=$(echo $post | tr / -)

gps_info() {
	t=$1
	f=$2
	l=$(exiv2 -P v -K Xmp.drone-dji.${t} ${f})

	if [ -z "$l" ]; then
		l=$(exiv2 -P v -K Exif.GPSInfo.GPS${t} ${f} | sed 's%^\([0-9]\+\)/\([0-9]\+\) \([0-9]\+\)/\([0-9]\+\) \([0-9]\+\)/\([0-9]\+\)$%\1 \2 \3 \4 \5 \6%' | awk '{ print $1/$2+$3/$4/60.0+$5/$6/3600.0 }')
		if [ -n "$l" ]; then
			d=$(exiv2 -P v -K Exif.GPSInfo.GPS${t}Ref ${f} | tr '[:upper:]' '[:lower:]')
			if [ "$d" = "s" -o "$d" = "w" ]; then
				l="-${l}"
			fi
		fi
	fi
	echo $l
}

latitude() {
	gps_info Latitude $1
}

longitude() {
	gps_info Longitude $1
}

for f in $(find assets/images/${post} -type f | sort); do
	id=${f##assets/images};
	id=${id%%.jpg};
	if [ $(basename ${id}) = "preview" -o $(basename ${id}) = "preview-full" ]; then continue; fi
	imgdate=$(exiv2 -K Exif.Photo.DateTimeOriginal -K Exif.Image.DateTimeOriginal -P v ${f} | head -n1 | awk '{gsub(/:/, "/", $1)} 1')
	latitude=$(latitude ${f})
	longitude=$(longitude ${f})

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
