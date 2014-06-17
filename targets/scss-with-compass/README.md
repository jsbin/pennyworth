How to install SASS and Compass support

  # update system gem
  sudo gem update --system
  # how to install gem on the system
  sudo gem install --no-user-install --no-document sass
  sudo gem install --no-user-install --no-document compass

Initialise the output folder as Compass project
This is not necessary as the script runs it if it doesn't find
the output folder
  compass init