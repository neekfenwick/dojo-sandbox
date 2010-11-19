#!/bin/bash
# A quick and dirty build helper for dojo-sandbox

BUILDSCRIPTS=../lib/dojo-release-1.5.0-src/util/buildscripts
if [[ ! -e $BUILDSCRIPTS ]] ; then
	echo Cannot find buildscripts dir $BUILDSCRIPTS
	exit 1
fi

pushd $BUILDSCRIPTS

COPYRIGHT=../../../../config/sandboxCopyright.txt
if [[ ! -e $COPYRIGHT ]] ; then
	echo Cannot find COPYRIGHT file $COPYRIGHT
	exit 1
fi

cp $COPYRIGHT .

echo Calling build.sh in `pwd`
./build.sh profile=../../../../../config/sandbox releaseName=dojo version=1.5.0-sandbox releaseDir=../../.. optimize=shrinksafe cssOptimize=comments layerOptimize=shrinksafe stripConsole=normal action=clean,release

popd
echo Finished at `date`