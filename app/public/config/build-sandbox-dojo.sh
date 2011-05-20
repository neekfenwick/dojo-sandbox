#!/bin/bash
# A quick and dirty build helper for dojo-sandbox

COPYRIGHT=sandboxCopyright.txt
if [[ ! -e $COPYRIGHT ]] ; then
	echo Cannot find COPYRIGHT file $COPYRIGHT
	exit 1
fi


function build_a_version() {
VERSION=$1
# --------------- dojo 1.6.1 ---------------
BUILDSCRIPTS=../lib/dojo-release-$VERSION-src/util/buildscripts
if [[ ! -e $BUILDSCRIPTS ]] ; then
	echo Cannot find buildscripts dir $BUILDSCRIPTS
	exit 1
fi

cp $COPYRIGHT $BUILDSCRIPTS

pushd $BUILDSCRIPTS

echo Calling build.sh in `pwd`
./build.sh profile=../../../../../config/sandbox releaseName=dojo-$VERSION-sandbox version=$VERSION-sandbox releaseDir=../../.. optimize=shrinksafe cssOptimize=comments layerOptimize=shrinksafe stripConsole=normal action=clean,release

./build.sh profile=../../../../../config/sandbox releaseName=dojo-$VERSION-sandbox-nooptimize version=$VERSION-sandbox releaseDir=../../.. optimize=none cssOptimize=none layerOptimize=none stripConsole=none action=clean,release

popd
# --------------- dojo $VERSION ---------------
}

build_a_version '1.5.1'
build_a_version '1.6.1'




echo Finished at `date`
