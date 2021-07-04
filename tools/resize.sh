#!/bin/bash

WATERMARK=$(dirname $0)/watermark.png
OPTS="-quality 85"
IMAGE_HEIGHT=${IMAGE_HEIGHT:-1024}

for img in $* ; do
	width=`convert $img -ping -format "%w" info:`
	height=`convert $img -ping -format "%h" info:`
	echo "${img}:${width}x${height}"

	if [ $width -lt $height ]; then
		resize="${IMAGE_HEIGHT}x"
	else
		resize="x${IMAGE_HEIGHT}"
	fi

	final=`basename $img`
	final="`date +%F`-${final:0:(-4)}.jpg"
	convert -resize "$resize" $OPTS $img tmp-$final
#	composite -dissolve 35% -gravity SouthEast watermark.png tmp-$final $final
	composite -gravity SouthEast ${WATERMARK} tmp-$final $final
	rm tmp-$final 
done

