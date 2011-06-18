#!/bin/bash

SCRIPT=`readlink -f $0`
SCRIPTPATH=`dirname $SCRIPT`

cd $SCRIPTPATH
./fetch_latest_and_build.sh
R=$?
echo R $R
if [[ $R != 0 ]] ; then
  echo Error building. Stopping.
  exit 1
fi

rm -rf ./dojo-daily
mv dojo-trunk-tmp/dojotoolkit/release/dojo ./0.0.0-trunk
mv dojo-trunk-tmp/dojotoolkit/release/dojo-nooptimize ./0.0.0-trunk-nooptimize
chown -R sandbox:sandbox 0.0.0-trunk
chown -R sandbox:sandbox 0.0.0-trunk-nooptimize
