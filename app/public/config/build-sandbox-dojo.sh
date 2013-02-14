#!/bin/bash
# A quick and dirty build helper for dojo-sandbox

COPYRIGHT=sandboxCopyright.txt
if [[ ! -e $COPYRIGHT ]] ; then
	echo Cannot find COPYRIGHT file $COPYRIGHT
	exit 1
fi


function build() {
VERSION=$1
BUILDSCRIPTS=../lib/dojo/util/buildscripts
if [[ ! -e $BUILDSCRIPTS ]] ; then
	echo Cannot find buildscripts dir $BUILDSCRIPTS
	exit 1
fi

cp $COPYRIGHT $BUILDSCRIPTS

pushd $BUILDSCRIPTS

echo Calling build.sh in `pwd`
./build.sh -p ../../../../config/sandbox -r --releaseName dojo-sandbox

#./build.sh -p ../../../../config/sandbox-nooptimize -r --releaseName $VERSION-sandbox-nooptimize

popd

pushd ../lib/dojo-sandbox
find . \( -name \*.uncompressed.js -o -name \*.consoleStripped.js \) -exec rm {} \;
popd
# --------------- dojo $VERSION ---------------
}

build

echo Finished at `date`
