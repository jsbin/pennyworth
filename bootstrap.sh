#!/usr/bin/env bash

# sudo apt-get install -y ruby
# sudo apt-get install -y ruby1.9.3-dev
# sudo apt-get install -y make
gem install bundler
bundle install
cd vendor/sass-frameworks
bourbon install
cd ../../targets/sass/output
compass init
cd sass
ln -s ../../../../vendor/sass-frameworks/bourbon ./bourbon
cd ../../../scss/output
compass init
cd sass
ln -s ../../../../vendor/sass-frameworks/bourbon ./bourbon