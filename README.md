# caravaggio
A gem for displaying the structure of Rails data models.

To install it, do the following:

* Include the Gem
* Include a link from the Gem in your Routes file.  The line should be something like this:
>     require "caravaggio/engine"
>     mount Caravaggio::Engine => "/db"
* Access Caravaggio from your application.  (In the above, you would find it by going to /db).
