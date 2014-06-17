How to install SASS and Compass support

  # update system gem
  sudo gem update --system
  # sass 3.3 or newer
  # how to install gem on the system
  sudo gem install --no-user-install --no-document sass
  # compass 1.0.0.alpha.19 or newer that supports sass 3.3
  sudo gem install --no-user-install --no-document --pre compass

Initialise the output folder as Compass project
This is not necessary as the script runs it if it doesn't find
the output folder
  compass init
