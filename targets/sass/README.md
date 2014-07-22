# [SASS](http://sass-lang.com/) and [Compass](http://compass-style.org/) support

## How to install

Installation procedure is declared in `bootstrap.sh`, which is run automatically by `npm install`.   
The ruby gems required are declared in `Gemfile` in the main pennyworth directory.

### Compass

Compass requires at least version 1.0.0 as previous version don't support Sass 3.3 (which have features highly requested by the users).

It's not necessary to manually create a Compass project for the targets as the script does it if it doesn't find the output folder.


## Install frameworks

If it's possible to have the physical files (via download or installation), these should be located in the `vendor/sass-frameworks' directory. This directory is included in the main `config.rb` for Compass, therefore all the files within can be imported in Sass/SCSS with a simple `@import frameworkname`.

If the framework requires the installation of a gem, this should be added in the main `Gemfile`.   
Also, check for its documentation for more eventual steps to follow to enable it.

### [Blueprint](http://compass-style.org/reference/blueprint/)

**Not included** in the current version of pennyworth. The documentation is for reference if it will be requested by users in the future.

First please read [this note](http://compass-style.org/blog/2012/05/20/removing-blueprint/) about Blueprint being removed from Compass.

    # install
    sudo gem install --no-user-install --no-document compass-blueprint

Add `require 'compass-blueprint'` to config.rb (at the end it's fine)

### [Bourbon](http://bourbon.io/)

Installation is handled automatically by bundle, it just requires the gem to be listed in `Gemfile`.   
The extension is enabled in pennyworth by the `bootstrap.sh` script, which will create the files in the `vendor/sass-frameworks` directoryand no further step is required.

To use it, import the mixins

    @import 'bourbon/bourbon';

To update it

    sudo bourbon update


## Custom configurations

In the main pennyworth directory we have the `config.rb` file. This is copied inside every target processor that runs Compass and eventually modified by the single processor according to its need (for example, Sass target adds the line `preferred_syntax = :sass` to it).

The `lib/sass_config.rb` file includes all the common configurations between the Compass projects and that can be declared outside the singles `config.rb`.   
Inside this file we declare custom importer that we use specifically for JS Bin.

We need a custom Sass importer to translate all the `@import 'binname/1.scss'` to `binname.1.scss`.

In `/lib/sass_config.rb` add these lines

    require File.join(File.dirname(__FILE__), 'importer.rb')
    Sass.load_paths << Sass::Importers::JSBin.new()

We also need a custom importer to call bins via http, in the case for some reason the physical file is not avaiable or if the reviosn-less bin is requested (`@import binname.scss`).

In `/lib/sass_config.rb` add these lines
    $url = "http://jsbin-dev.com/" # the absolute url from which we look for files
    $timeout = 5 # in seconds # after how many seconds the http request stops if it's still loading
    require File.join(File.dirname(__FILE__), 'importer_http.rb')
    Sass.load_paths << Sass::Importers::HTTP.new($url, $timeout)

This `load_paths` must be after the previous one, to have the correct fallback (if that import doesn't work, fallback to this).

