#!/bin/bash
# deploy.sh
# A helper script to rsync the right bits to Live

if [[ ! -d app ]] ; then
	echo I expect to be run from the top level dir containing the 'app' dir
	exit 1
fi

# rsync to remote server, avoiding copying the
#  configs which are platform specific.
rsync --recursive --update --verbose --compress --exclude=app/application/configs --port=222 app sandbox@dojo-sandbox/var/www/sandbox
