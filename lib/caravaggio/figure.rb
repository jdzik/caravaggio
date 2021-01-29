# a Figure is a representation of a model.  (Get it?)
module Caravaggio
  class Figure
    def initialize(model)
      @model = model
    end
    
    def to_s
      "Figure for #{@model.name}"
    end
    
    def to_json
      @to_json ||= to_h.to_json
    end
    
    def to_h
      puts "#{@model.name} to_json"
      @to_h ||= {
        name: @model.name,
        columns: @model.column_names.sort,
        associations: {
          belongs_to: associations_to_h(@model.reflect_on_all_associations(:belongs_to)),
          has_one: associations_to_h(@model.reflect_on_all_associations(:has_one)),
          has_many: associations_to_h(@model.reflect_on_all_associations(:has_many)),
          has_and_belongs_to_many: associations_to_h(@model.reflect_on_all_associations(:has_and_belongs_to_many))
        }
      }
    end
    
    def associations_to_h(associations)
      associations.map{|association| association_to_h(association)}
    end
    
    def association_to_h(association)
      options = {}
      association.options.each do |k, v|
        options[k.to_s] = v.to_s
      end
      class_name = options["class_name"] || association.name.to_s.singularize.camelize
      options.delete "class_name"
      {
        name: association.macro == :belongs_to || association.macro == :has_one ? association.name : association.plural_name,
        class_name: class_name,
        options: options
      }
    end
  end
end