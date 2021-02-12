require "caravaggio/figure"

# A Canvas is an entire picture of a system.  It contains many figures.  (Get it?)
module Caravaggio
  class Canvas
    def initialize
      @figures = ActiveRecord::Base.descendants.sort{|s1, s2| s1.name <=> s2.name}.map{|model| Figure.new(model)}
    end
    
    def models
      @figures.map{|figure| figure.model}
    end
    
    def associations
      @figures.map{|figure| figure.associations}.flatten
    end
  end
end