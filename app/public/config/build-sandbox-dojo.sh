#!/bin/bash
# A quick and dirty build helper for dojo-sandbox

COPYRIGHT=sandboxCopyright.txt
if [[ ! -e $COPYRIGHT ]] ; then
	echo Cannot find COPYRIGHT file $COPYRIGHT
	exit 1
fi

# --------------- dojo 1.6.1 ---------------
BUILDSCRIPTS=../lib/dojo-release-1.6.1-src/util/buildscripts
if [[ ! -e $BUILDSCRIPTS ]] ; then
	echo Cannot find buildscripts dir $BUILDSCRIPTS
	exit 1
fi

cp $COPYRIGHT $BUILDSCRIPTS

pushd $BUILDSCRIPTS

echo Calling build.sh in `pwd`
./build.sh profile=../../../../../config/sandbox releaseName=dojo-1.6.1-sandbox version=1.6.1-sandbox releaseDir=../../.. optimize=shrinksafe cssOptimize=comments layerOptimize=shrinksafe stripConsole=normal action=clean,release

./build.sh profile=../../../../../config/sandbox releaseName=dojo-1.6.1-sandbox-nooptimize version=1.6.1-sandbox releaseDir=../../.. optimize=none cssOptimize=none layerOptimize=none stripConsole=none action=clean,release

popd
# --------------- dojo 1.6.1 ---------------



echo Finished at `date`
