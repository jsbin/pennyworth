#!/usr/bin/env bash

# sudo apt-get install -y ruby
# sudo apt-get install -y ruby1.9.3-dev
# sudo apt-get install -y make

gem install bundler
bundle install

# gem update --system
# gem install --no-user-install --no-document --pre compass
# gem install --no-user-install --no-document bourbon

cd vendor/sass-frameworks
bourbon install
cd ../../targets/sass/output
compass init
cd ../../scss/output
compass init
