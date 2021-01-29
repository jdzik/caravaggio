require "caravaggio/figure"

# A Canvas is an entire picture of a system.  It contains many figures.  (Get it?)
module Caravaggio
  class Canvas
    def initialize
      @figures = ActiveRecord::Base.descendants.map{|model| Figure.new(model)}
    end
    
    def to_json
      @figures.map{|figure| figure.to_h}.to_json
    end
  end
end