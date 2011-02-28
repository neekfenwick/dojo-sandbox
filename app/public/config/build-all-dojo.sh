#!/bin/bash
# A quick and dirty build helper for dojo-sandbox

COPYRIGHT=sandboxCopyright.txt
if [[ ! -e $COPYRIGHT ]] ; then
	echo Cannot find COPYRIGHT file $COPYRIGHT
	exit 1
fi


# --------------- dojo 1.4.3 ---------------
BUILDSCRIPTS=../lib/dojo-release-1.4.3-src/util/buildscripts
if [[ ! -e $BUILDSCRIPTS ]] ; then
	echo Cannot find buildscripts dir $BUILDSCRIPTS
	exit 1
fi

cp $COPYRIGHT $BUILDSCRIPTS

pushd $BUILDSCRIPTS

echo Calling build.sh in `pwd`

./build.sh profile=standard releaseName=dojo-1.4.3 version=1.4.3-standard releaseDir=../../.. optimize=shrinksafe cssOptimize=comments layerOptimize=shrinksafe stripConsole=normal action=clean,release

./build.sh profile=standard releaseName=dojo-1.4.3-nooptimize version=1.4.3-standard-nooptimize releaseDir=../../.. optimize=none cssOptimize=none layerOptimize=none stripConsole=none action=clean,release

popd
# --------------- dojo 1.4.3 ---------------

# --------------- dojo 1.5.0 ---------------
BUILDSCRIPTS=../lib/dojo-release-1.5.0-src/util/buildscripts
if [[ ! -e $BUILDSCRIPTS ]] ; then
	echo Cannot find buildscripts dir $BUILDSCRIPTS
	exit 1
fi

cp $COPYRIGHT $BUILDSCRIPTS

pushd $BUILDSCRIPTS

echo Calling build.sh in `pwd`

./build.sh profile=standard releaseName=dojo-1.5.0 version=1.5.0-standard releaseDir=../../.. optimize=shrinksafe cssOptimize=comments layerOptimize=shrinksafe stripConsole=normal action=clean,release

./build.sh profile=standard releaseName=dojo-1.5.0-nooptimize version=1.5.0-standard-nooptimize releaseDir=../../.. optimize=none cssOptimize=none layerOptimize=none stripConsole=none action=clean,release

popd
# --------------- dojo 1.5.0 ---------------



echo Finished at `date`