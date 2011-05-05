#!/bin/bash

# Use the same dir each time so svn doesn't have to re-fetch too much
TMPDIR=/tmp/dojo-trunk
BUILDSTAMP=`date +%Y-%m-%d:%H-%M`
echo BUILDSTAMP $BUILDSTAMP

function fetch() {
	echo Working for $1
	if [[ -d $1 ]] ; then
		echo Updating existing $1..
		#svn up https://svn.dojotoolkit.org/branches/$1
		svn co http://svn.dojotoolkit.org/src/view/anon/all/trunk dojotoolkit
		if [[ $? != 0 ]] ; then
			echo Error $!
			exit 1;
		fi
	else
		echo Checking out fresh $1..
		#svn co https://svn.dojotoolkit.org/branches/$1
		svn co http://svn.dojotoolkit.org/src/view/anon/all/trunk dojotoolkit
		if [[ $? != 0 ]] ; then
			echo Error $!
			exit 1;
		fi
	fi
}

function build() {
	echo Building for $1
	if [[ ! -x $1/util/buildscripts/build.sh ]] ; then
		echo Cannot find build.sh for $1!
		exit 1;
	fi
	pushd $1/util/buildscripts
	VERSION=$2-$BUILDSTAMP
echo VERSION: $VERSION
	echo ./build.sh profile=standard releaseName=dojo-$2 version=${VERSION}-standard releaseDir=../../.. optimize=shrinksafe cssOptimize=comments layerOptimize=shrinksafe stripConsole=normal action=clean,release
	./build.sh profile=standard releaseName=dojo-$2 version=${VERSION}-standard releaseDir=../../../release/wibble-$2 optimize=shrinksafe cssOptimize=comments layerOptimize=shrinksafe stripConsole=normal action=clean,release
	if [[ $? != 0 ]] ; then
		echo Build failed for $1!
		exit 1
	fi
	./build.sh profile=standard releaseName=dojo-$2-nooptimize version=${VERSION}-standard-nooptimize releaseDir=../../../release/wibble-nooptimize-$2 optimize=none cssOptimize=none layerOptimize=none stripConsole=none action=clean,release
	if [[ $? != 0 ]] ; then
		echo Build failed for $1 nooptimize!
		exit 1
	fi

	popd
}

function deploy() {

	RELEASE_DIR=$1/release/dojo-$1
	if [[ ! -d $RELEASE_DIR ]] ; then
		echo Build not found at $RELEASE_DIR
		exit 1
	fi

	echo Deploying build from $RELEASE_DIR to dojo-trunk-$1...
	cp -r $1/release/dojo-$1 dojo-trunk-$1

	RELEASE_DIR=$1/release/dojo-$1-nooptimize
	if [[ ! -d $RELEASE_DIR ]] ; then
		echo Build not found at $RELEASE_DIR
		exit 1
	fi

	echo Deploying build from $RELEASE_DIR to dojo-trunk-$1-nooptimize...
	cp -r $RELEASE_DIR dojo-trunk-$1-nooptimize

}

echo Fetching latest...

if [[ ! -d dojo-trunk-tmp ]] ; then mkdir dojo-trunk-tmp ; fi
pushd dojo-trunk-tmp

fetch "dojotoolkit" "trunk";

build "dojotoolkit" "trunk";

deploy "dojotoolkit" "trunk";
popd
