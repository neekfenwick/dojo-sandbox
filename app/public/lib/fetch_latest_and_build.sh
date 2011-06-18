#!/bin/bash

# Use the same dir each time so svn doesn't have to re-fetch too much
TMPDIR=/tmp/dojo-trunk
BUILDSTAMP=`date +%Y%m%dT%H%M`
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
	#if [[ ! -x $1/util/build/build.sh ]] ; then
		#echo Cannot find build.sh for $1!
		#exit 1;
	#fi
	pushd $1/util/build
	VERSION=$2-$BUILDSTAMP
echo VERSION: $VERSION
	#echo java -Xms256m -Xmx256m  -cp ../shrinksafe/js.jar:../closureCompiler/compiler.jar:../shrinksafe/shrinksafe.jar org.mozilla.javascript.tools.shell.Main  ../../dojo/dojo.js baseUrl=../../dojo load=build profile=standard releaseName=0.0.0-$2 version=${VERSION}standard optimize=shrinksafe cssOptimize=comments layerOptimize=shrinksafe stripConsole=normal action=clean,release
	echo /opt/bin/node ../../dojo/dojo.js load=build profile=standard releaseName=0.0.0-$2 version=${VERSION}standard optimize=shrinksafe cssOptimize=comments layerOptimize=shrinksafe stripConsole=normal action=clean,release
	#java -Xms256m -Xmx256m  -cp ../shrinksafe/js.jar:../closureCompiler/compiler.jar:../shrinksafe/shrinksafe.jar org.mozilla.javascript.tools.shell.Main  ../../dojo/dojo.js baseUrl=../../dojo load=build profile=standard releaseName=$2 version=${VERSION}standard optimize=shrinksafe cssOptimize=comments layerOptimize=shrinksafe stripConsole=normal action=clean,release
	/opt/bin/node ../../dojo/dojo.js load=build profile=standard releaseName=$2 version=${VERSION}standard optimize=shrinksafe cssOptimize=comments layerOptimize=shrinksafe stripConsole=normal action=clean,release
	if [[ $? != 0 ]] ; then
		echo Build failed for $1!
		exit 1
	fi
	#java -Xms256m -Xmx256m  -cp ../shrinksafe/js.jar:../closureCompiler/compiler.jar:../shrinksafe/shrinksafe.jar org.mozilla.javascript.tools.shell.Main  ../../dojo/dojo.js baseUrl=../../dojo load=build profile=standard releaseName=$2-nooptimize version=${VERSION}standard-nooptimize action=clean,release
	/opt/bin/node ../../dojo/dojo.js load=build profile=standard releaseName=$2-nooptimize version=${VERSION}standard-nooptimize action=clean,release
	if [[ $? != 0 ]] ; then
		echo Build failed for $1 nooptimize!
		exit 1
	fi

	popd
}

function deploy() {

	RELEASE_DIR=$1/release/$2
	if [[ ! -d $RELEASE_DIR ]] ; then
		echo Build not found at $RELEASE_DIR
		exit 1
	fi

	echo Deploying build from $RELEASE_DIR...
	rm -rf ../$2
	mv $RELEASE_DIR ../

	RELEASE_DIR=$1/release/$2-nooptimize
	if [[ ! -d $RELEASE_DIR ]] ; then
		echo Build not found at $RELEASE_DIR
		exit 1
	fi

	echo Deploying build from $RELEASE_DIR...
	rm -rf ../$2-nooptimize
	mv $RELEASE_DIR ../

}

echo Fetching latest...

if [[ ! -d dojo-trunk-tmp ]] ; then mkdir dojo-trunk-tmp ; fi
pushd dojo-trunk-tmp

fetch "dojotoolkit" "trunk";

build "dojotoolkit" "dojo-0.0.0-trunk";

deploy "dojotoolkit" "dojo-0.0.0-trunk";
popd
