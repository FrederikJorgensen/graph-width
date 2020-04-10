#!/bin/sh
cd PACE2017-TrackA
echo "First arg: $1"
./tw-exact < ../uploads/$1 > ../treedecompositions/$2