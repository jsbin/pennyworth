# [SASS](http://sass-lang.com/) and [Compass](http://compass-style.org/) support

## How to install
    # update system gem
    sudo gem update --system
    # sass 3.3 or newer
    # how to install gem on the system
    sudo gem install --no-user-install --no-document sass
    # compass 1.0.0.alpha.19 or newer that supports sass 3.3
    sudo gem install --no-user-install --no-document --pre compass

Initialise the output folder as Compass project.  
This is not necessary as the script runs it if it doesn't find the output folder

    mkdir output
    # for scss
    compass create output
    # for sass
    compass create --syntax sass output

## Install frameworks

### [Blueprint](http://compass-style.org/reference/blueprint/)

First please read [this note](http://compass-style.org/blog/2012/05/20/removing-blueprint/) about Blueprint being removed from Compass.

    # install
    sudo gem install --no-user-install --no-document compass-blueprint

Add `require 'compass-blueprint'` to config.rb (at the end it's fine)


### [Bourbon](http://bourbon.io/)

Install

    # install
    sudo gem install --no-user-install --no-document bourbon
    # create and install the folder under pennyworth
    mkdir sass-frameworks
    cd sass-frameworks
    bourbon install

Create symbolic link to the bourbon folder for every target output

    cd targets/target_name/output/sass
    ln -s /pennyworth/vendor/sass-frameworks/bourbon ./bourbon

To use, import the mixins

    @import 'bourbon/bourbon';

To update

    sudo bourbon update
