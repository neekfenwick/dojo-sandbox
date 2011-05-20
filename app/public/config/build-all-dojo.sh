#!/bin/bash
# A quick and dirty build helper for dojo-sandbox

COPYRIGHT=sandboxCopyright.txt
if [[ ! -e $COPYRIGHT ]] ; then
	echo Cannot find COPYRIGHT file $COPYRIGHT
	exit 1
fi


function buildAVersion() {
	VERSION=$1
	echo Test ../lib/dojo-$VERSION ...
	if [[ -e ../lib/dojo-$VERSION ]] ; then
		echo Version $VERSION already built!
		return
	fi

	BUILDSCRIPTS=../lib/dojo-release-$VERSION-src/util/buildscripts
	if [[ ! -e $BUILDSCRIPTS ]] ; then
		echo Cannot find buildscripts dir $BUILDSCRIPTS
		exit 1
	fi

	cp $COPYRIGHT $BUILDSCRIPTS

	pushd $BUILDSCRIPTS

	echo Calling build.sh in `pwd`

	./build.sh profile=standard releaseName=dojo-${VERSION} version=${VERSION}-standard releaseDir=../../.. optimize=shrinksafe cssOptimize=comments layerOptimize=shrinksafe stripConsole=normal action=clean,release

	./build.sh profile=standard releaseName=dojo-${VERSION}-nooptimize version=${VERSION}-standard-nooptimize releaseDir=../../.. optimize=none cssOptimize=none layerOptimize=none stripConsole=none action=clean,release

	popd
}

buildAVersion "1.4.3"
buildAVersion "1.5.0"
buildAVersion "1.5.1"
buildAVersion "1.6.0"
buildAVersion "1.6.1"

echo Finished at `date`
