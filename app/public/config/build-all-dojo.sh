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

function buildNewVersion() {
	VERSION=$1
	echo Test ../lib/dojo-$VERSION ...
	if [[ -e ../lib/dojo-$VERSION && -e ../lib/dojo-$VERSION-nooptimize ]] ; then
		echo Version $VERSION already built!
		return
	fi

	DOJODIR=../lib/dojo-release-$VERSION-src
	if [[ ! -d $DOJODIR ]] ; then
		echo Dojo dir doesn\'t exist yet!  Fetching...
		pushd ../lib
		wget http://download.dojotoolkit.org/release-${VERSION}/dojo-release-${VERSION}-src.tar.gz
		if [[ $? != 0 ]] ; then echo Error downloading! ; exit 1 ; fi
		tar xzf dojo-release-${VERSION}-src.tar.gz
		rm dojo-release-${VERSION}-src.tar.gz
		popd
	fi

	if [[ ! -d $DOJODIR/dgrid ]] ; then
		echo Fetching dgrid for $VERSION
		pushd $DOJODIR
		git clone git://github.com/SitePen/dgrid.git
		if [[ $? != 0 ]] ; then echo Error downloading! ; exit 1 ; fi
		pushd dgrid
		git checkout v0.3.1
		if [[ $? != 0 ]] ; then echo Error downloading! ; exit 1 ; fi
		popd
		popd
	fi
	if [[ ! -d $DOJODIR/put-selector ]] ; then
		echo Fetching put-selector for $VERSION
		pushd $DOJODIR
		git clone git://github.com/kriszyp/put-selector.git
		if [[ $? != 0 ]] ; then echo Error downloading! ; exit 1 ; fi
		pushd put-selector
		git checkout v0.3.0
		if [[ $? != 0 ]] ; then echo Error downloading! ; exit 1 ; fi
		popd
		popd
	fi
	if [[ ! -d $DOJODIR/xstyle ]] ; then
		echo Fetching xstyle for $VERSION
		pushd $DOJODIR
		git clone git://github.com/kriszyp/xstyle.git
		if [[ $? != 0 ]] ; then echo Error downloading! ; exit 1 ; fi
		pushd xstyle
		git checkout v0.0.5
		if [[ $? != 0 ]] ; then echo Error downloading! ; exit 1 ; fi
		popd
		popd
	fi

	BUILDSCRIPTS=../lib/dojo-release-$VERSION-src/util/buildscripts
	if [[ ! -e $BUILDSCRIPTS ]] ; then
		echo Cannot find buildscripts dir $BUILDSCRIPTS
		exit 1
	fi

	cp $COPYRIGHT $BUILDSCRIPTS
	cp standardplusdgrid*profile.js $BUILDSCRIPTS/profiles

	pushd $BUILDSCRIPTS


	echo Calling build.sh in `pwd`

	./build.sh -r -p profiles/standardplusdgrid --releaseDir ../../.. --releaseName dojo-$VERSION

	./build.sh -r -p profiles/standardplusdgridnooptimize --releaseDir ../../.. --releaseName dojo-$VERSION-nooptimize

	popd
}

#buildAVersion "1.4.3"
#buildAVersion "1.5.0"
#buildAVersion "1.5.1"
#buildAVersion "1.6.0"
#buildAVersion "1.6.1"
buildNewVersion "1.7.3"
buildNewVersion "1.8.0"
buildNewVersion "1.8.1"
buildNewVersion "1.8.2"
buildNewVersion "1.8.3"

echo Finished at `date`
