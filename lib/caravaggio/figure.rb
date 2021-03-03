# a Figure is a representation of a model.  (Get it?)
module Caravaggio
  class Figure
    def initialize(model)
      @model = model
    end
    
    def name
      @name ||= clean_name(@model.name)
    end
    
    def friendly_name
      @friendly_name ||= name.gsub(/::/, '_')
    end
    
    def short_name
      @short_name ||= (name.length > 20 ? "..." : "") + name.chars.last(20).join
    end
    
    def to_s
      "Figure for #{@model.name}"
    end
    
    def to_json
      @to_json ||= to_h.to_json
    end
    
    def model
      @model_hash ||= {
        id: name,
        friendly_name: friendly_name,
        short_name: short_name,
        columns: @model.column_names.sort,
        associated_classes: associations.map{|association| association[:target]}
      }
    end
    
    def associations
      @associations ||= (associations_to_h(:belongs_to, @model.reflect_on_all_associations(:belongs_to)) + 
        associations_to_h(:has_one, @model.reflect_on_all_associations(:has_one)) +
        associations_to_h(:has_many, @model.reflect_on_all_associations(:has_many)) +
        associations_to_h(:has_and_belongs_to_many, @model.reflect_on_all_associations(:has_and_belongs_to_many))).flatten
    end
    
    def associations_to_h(association_type, associations)
      associations.map{|association| association_to_h(association_type, association)}
    end
    
    def to_models
      @to_models ||= associations.map{|association| association[:to]}.sort.uniq
    end
    
    def association_to_h(association_type, association)
      options = {}
      association.options.each do |k, v|
        options[k.to_s] = v.to_s
      end
      
      {
        source: name,
        target: to_class_name(association),
        name: association.macro == :belongs_to || association.macro == :has_one ? association.name : association.plural_name,
        options: options,
        association_type: association_type
      }
    end
    
    def clean_name(_name)
      _name.gsub(/^::/, "")
    end
    
    def self.add_backlinks(figures)
      figures.each do |from_figure|
        from_figures[:from] = []
        figures.each do |to_figure|
          if to_figure.name != from_figure.name && to_figure.to_models.include?(from_figure.name)
            from_figures[:from] << to_figure.name
          end
          from_figures[:from].sort!
        end
      end
    end
    
    def to_class_name(association)
      class_name = association.options[:class_name] || association.name.to_s.singularize.camelize
      begin
        class_name = association.klass.name
      rescue => e
      end
      clean_name(class_name)
    end
  end
end