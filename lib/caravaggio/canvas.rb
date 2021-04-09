require "caravaggio/figure"

# A Canvas is an entire picture of a system.  It contains many figures.  (Get it?)
module Caravaggio
  class Canvas
    attr_reader :figures
    
    def initialize
      Rails.application.eager_load!
      @figures = ActiveRecord::Base.descendants.reject{|c| c.abstract_class}.sort{|s1, s2| s1.name <=> s2.name}.map{|model| Figure.new(model)}
    end
    
    def models
      @figures.map{|figure| figure.model}
    end
    
    def associations
      if @associations.nil?
        @associations = @figures.map{|figure| figure.associations}.flatten
        @associations.each_with_index do |association, index|
          association[:index] = index
        end
      end
      @associations
    end
  end
end