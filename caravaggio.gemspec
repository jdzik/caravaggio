$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "caravaggio/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "caravaggio"
  s.version     = Caravaggio::VERSION
  s.authors     = ["jdzik"]
  s.email       = ["joe.dzikiewicz@framebridge.com"]
  s.homepage    = ""
  s.summary     = "Shine light on ActiveRecord entities and relationships."
  s.description = "Shine light on ActiveRecord entities and relationships."
  s.license     = "MIT"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.rdoc"]
  s.test_files = Dir["test/**/*"]
end
