#!/bin/bash

# A generic script that can be customized using various environmental variables (@see: README.md)
# Defaults in this script are suitable for production use.
#
# ATTENTION: You would want to use dev_start.sh script, while developing, instead.

# Set NODE_PATH env variable to 'app' so that application specific modules
# are first class citizens of the application
# export NODE_PATH=$NODE_PATH:$PWD/app

export NODE_SERVE_STATIC=1

while getopts "t" opt; do
  case $opt in
    t) NB_TAIL_LOGS=1;;
  esac
done

if [ ! -d "$PWD/bin" -o ! -d "$PWD/app" ]; then
  echo "Please run the shell script from project's root folder"
  exit
fi

# Disable the runtime.json thing of config.js. It's annoying and sometimes breaks clustering.
export NODE_CONFIG_DISABLE_FILE_WATCH="Y"

# Setup metalogger
export NODE_LOGGER_LEVEL='notice'
export NODE_LOGGER_GRANULARLEVELS=0
export NODE_LOGGER_PLUGIN='util'

NBS_CURR_PROJECT_PATH=$PWD

if [ ! $NODE_LAUNCH_SCRIPT ]; then
  export NODE_LAUNCH_SCRIPT="$NBS_CURR_PROJECT_PATH/main.js"
fi

if [ ! -f "$NODE_LAUNCH_SCRIPT" ]; then
  echo "Launch script: '$NODE_LAUNCH_SCRIPT' could not be located. Aborting..."
  exit
fi
echo $NODE_ENV
if [ ! $NODE_ENV ]; then
  export NODE_ENV=production
  echo $NODE_ENV
fi

if [ ! $NODE_CLUSTERED ]; then
  export NODE_CLUSTERED=1
fi

if [ ! $NODE_SERVE_STATIC ]; then
  export NODE_SERVE_STATIC=0
fi

if [ ! $NODE_HOT_RELOAD ]; then
  export NODE_HOT_RELOAD=0
fi

if [ ! $NODE_LOG_DIR ]; then
  export NODE_LOG_DIR="$NBS_CURR_PROJECT_PATH/storage/logs"
fi
if [ ! -d "$NODE_LOG_DIR" ]; then
  mkdir $NODE_LOG_DIR -p
fi

if [ ! -f "$NODE_LOG_DIR/forever.log" ]; then
    touch $NODE_LOG_DIR/forever.log
fi

if [ ! -f "$NODE_LOG_DIR/out.log" ]; then
    touch $NODE_LOG_DIR/out.log
fi

if [ ! -f "$NODE_LOG_DIR/err.log" ]; then
    touch $NODE_LOG_DIR/err.log
fi


# Let's make sure you have forever/nodemon installed, if we are gonna need it:
if [ $NODE_HOT_RELOAD -eq 0 ] && [ ! `which forever` ]; then
    echo "ERROR: Please install forever with:";
    echo "  npm install forever -g";
    exit 1;
fi

if [ $NODE_HOT_RELOAD -eq 1 ] && [ ! `which nodemon` ]; then
    echo "ERROR: Please install nodemon with:";
    echo "  npm install nodemon -g";
    exit 1;
fi

# Let's make sure you NODE_HOT_RELOAD is set to one of the only two allowed values
if [ ! $NODE_HOT_RELOAD -eq 1 ] && [ ! $NODE_HOT_RELOAD -eq 0 ]; then
    echo "ERROR: The only two valid values for NODE_HOT_RELOAD are '1' and '0'. You are trying to set $NODE_HOT_RELOAD";
    exit 1
fi

# @TODO: not necessarily the best way to stop the process
if [ !$NODE_HOT_RELOAD ]; then
    forever stop $NODE_LAUNCH_SCRIPT >/dev/null 2>&1
fi

# Now that we know there is no old version running, let's start the processes

if [ $NODE_HOT_RELOAD -eq 0 ]; then
    NCMD="forever start"
    NCMD="$NCMD -a"
    NCMD="$NCMD -l $NODE_LOG_DIR/forever.log"
    NCMD="$NCMD -o $NODE_LOG_DIR/out.log"
    NCMD="$NCMD -e $NODE_LOG_DIR/err.log"
else
    NCMD="nodemon"
fi

NCMD="$NCMD $NODE_LAUNCH_SCRIPT"

$NCMD

if [ $NODE_HOT_RELOAD -eq 0 ]; then
    echo "--------------- NOTE: --------------"
    echo "You can stop the application by running (in this folder):"
    echo "  > forever stop $NODE_LAUNCH_SCRIPT"
    echo "You can see all Forever-running node apps by issuing:"
    echo "  > forever list"
    echo "See more about Forever at: https://github.com/indexzero/forever"
    echo "------------------------------------"
fi

if [ $NB_TAIL_LOGS ] && [ $NODE_HOT_RELOAD -eq 0 ]; then
  tail -f $NODE_LOG_DIR/forever.log
fi